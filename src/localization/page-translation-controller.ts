import type { TranslationNoticeState } from '../application/translation-notice-state';
import type {
  DomTranslationTarget,
  RetranslationResult,
  TranslationPageAdapter,
  TranslationRenderer,
} from '../application/ports';
import type {
  TranslationContextMetadata,
  TranslationProvider,
  TranslationRequest,
} from '../core/translation-provider';
import {
  PlaceholderIntegrityError,
  type PreparedTranslation,
  type TextReplacement,
  type TranslationTextPolicy,
} from '../core/translation-text-policy';
import {
  splitDomTranslationParagraphs,
  type DomTranslationParagraphPart,
} from '../rendering/dom-translation-format';
import { CommentVisibility } from './comment-visibility';
import { HELP_SELECTORS } from '../sites/mountain-project/contract/selectors/help';
import {
  TranslationLedger,
  type TranslationRecord,
} from '../core/translation-record';

interface TranslateManyOptions {
  userInitiated?: boolean;
  checkAvailability?: boolean;
  generation?: number;
}

interface ResolvedTranslation {
  cacheKey: string;
  translated: string;
}

export interface PageTranslationControllerOptions {
  pageKind?: string;
  textPolicy?: TranslationTextPolicy;
  onNoticeChange?: (state: TranslationNoticeState | undefined) => void;
}

export interface TranslationWorkMetrics {
  providerCalls: number;
  cacheHits: number;
  preparedCharacters: number;
  protectedSpans: number;
  glossarySpans: number;
  integrityFailures: number;
  glossaryFallbacks: number;
}

const USER_START_REQUIRED_MESSAGE = '브라우저 번역 언어팩 준비를 기다리고 있습니다. 다음 페이지 상호작용에서 자동으로 다시 시도합니다.';
const UNSUPPORTED_MESSAGE = '현재 이 브라우저에서는 페이지 본문 번역 엔진을 사용할 수 없습니다. 원문을 유지합니다.';
const EXTENSION_CONTENT_SELECTOR = [
  '.mpkr-machine-translation',
  '.mpkr-translation-notice',
  '.mpkr-original-toggle-host',
  '.mpkr-area-heading-source',
  '.mpkr-text-run-source',
  HELP_SELECTORS.inlineSource,
].join(', ');

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isUserStartRequiredError(error: unknown): boolean {
  return /user gesture|user activation/i.test(errorMessage(error));
}

function isProviderUnavailableError(error: unknown): boolean {
  return /translator api is unavailable/i.test(errorMessage(error));
}

function isLongInputError(error: unknown): boolean {
  const name = error instanceof Error ? error.name : '';
  return name === 'QuotaExceededError'
    || /quota|input.{0,20}(?:too long|too large|limit)|(?:too long|too large).{0,20}input/i.test(errorMessage(error));
}

function userFacingFailureMessage(error: unknown): string {
  if (isLongInputError(error)) {
    return '글이 길어 번역하지 못했습니다. 재번역해 주세요.';
  }
  return '번역하지 못했습니다. 잠시 후 재번역해 주세요.';
}

function isExtensionContent(node: Node): boolean {
  const element = node.nodeType === Node.ELEMENT_NODE
    ? node as Element
    : node.parentElement;
  return Boolean(element?.closest(EXTENSION_CONTENT_SELECTOR));
}

function isAuthoredContentMutation(record: MutationRecord): boolean {
  if (isExtensionContent(record.target)) {
    return false;
  }
  if (record.type === 'characterData') {
    return true;
  }

  const changedNodes = [...record.addedNodes, ...record.removedNodes];
  return changedNodes.length === 0
    || changedNodes.some((node) => !isExtensionContent(node));
}

export class PageTranslationController {
  private readonly processed = new Map<string, string>();
  private readonly targets = new Map<string, DomTranslationTarget>();
  private observer: MutationObserver | undefined;
  private userStartRetryArmed = false;
  private noticeScheduled = false;
  private recoveryInFlight = false;
  private stopped = false;
  private generation = 0;
  private readonly ready = new Map<string, DomTranslationTarget>();
  private readonly cache = new Map<string, string>();
  private cacheCharacters = 0;
  private drainPromise: Promise<void> | undefined;
  private mutationRecords: MutationRecord[] = [];
  private mutationScheduled = false;
  private readonly visibleComments = new Set<string>();
  private readonly terminalFailures = new Set<string>();
  private readonly terminalUserRetries = new Set<string>();
  private readonly inFlightTargets = new Set<string>();
  private readonly metrics: TranslationWorkMetrics = {
    providerCalls: 0,
    cacheHits: 0,
    preparedCharacters: 0,
    protectedSpans: 0,
    glossarySpans: 0,
    integrityFailures: 0,
    glossaryFallbacks: 0,
  };
  private readonly visibility = new CommentVisibility((target, visible) => {
    if (!this.isCurrentTarget(target, this.generation)) return;
    if (!visible) {
      this.visibleComments.delete(target.id);
      this.ready.delete(target.id);
      return;
    }
    this.visibleComments.add(target.id);
    if (this.ledger.get(target.id)?.status === 'pending') {
      void this.dispatch([target], { generation: this.generation });
    }
  });

  constructor(
    private readonly provider: TranslationProvider,
    readonly ledger: TranslationLedger,
    private readonly adapter: TranslationPageAdapter,
    private readonly renderer: TranslationRenderer,
    private readonly options: PageTranslationControllerOptions = {},
  ) {
    this.renderer.setRetranslateHandler?.((targetIds) => this.retranslate(targetIds));
  }

  metricsSnapshot(): Readonly<TranslationWorkMetrics> {
    return { ...this.metrics };
  }

  async start(): Promise<void> {
    this.stopped = false;
    this.generation += 1;
    const generation = this.generation;
    this.observer?.disconnect();
    this.observer = undefined;
    const targets = [
      ...this.adapter.collectPageTargets(),
      ...this.adapter.collectCommentTargets(),
    ];
    this.observer = new MutationObserver((records) => {
      if (!this.isActive(generation) || !records.some(isAuthoredContentMutation)) {
        return;
      }
      this.mutationRecords.push(...records.filter(isAuthoredContentMutation));
      if (this.mutationScheduled) return;
      this.mutationScheduled = true;
      queueMicrotask(() => {
        if (!this.isActive(generation)) return;
        this.mutationScheduled = false;
        const mutations = this.mutationRecords.splice(0);
        this.pruneDisconnected();
        this.visibility.refresh();
        const roots = this.adapter.mutationRoots?.(mutations) ?? [];
        const targets = roots.flatMap((root) => [
          ...this.adapter.collectPageTargets(root),
          ...this.adapter.collectCommentTargets(root),
        ]);
        void this.translateMany(targets, { generation });
      });
    });
    this.observer.observe(document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    await this.translateMany(targets, { generation });
  }

  registerExternal(record: TranslationRecord): void {
    this.record(record);
  }

  async retry(): Promise<void> {
    const generation = this.generation;
    if (!this.isActive(generation) || this.recoveryInFlight) {
      return;
    }
    this.disarmUserStartRetry();

    const retryable = this.ledger.snapshot()
      .filter((record) => (
        record.status === 'waiting-user-start'
        || record.status === 'failed'
        || record.status === 'unsupported'
      ))
      .filter((record) => !this.terminalFailures.has(record.id))
      .map((record) => ({
        record,
        target: this.targets.get(record.id),
      }))
      .filter((entry): entry is { record: TranslationRecord; target: DomTranslationTarget } => (
        Boolean(entry.target)
      ));
    const waiting = retryable
      .filter((entry) => entry.record.status === 'waiting-user-start')
      .map((entry) => entry.target);
    const availabilityChecked = retryable
      .filter((entry) => entry.record.status !== 'waiting-user-start')
      .map((entry) => entry.target);
    [...waiting, ...availabilityChecked].forEach((target) => this.processed.delete(target.id));

    this.recoveryInFlight = true;
    this.scheduleNotice();
    const jobs: Promise<void>[] = [];
    if (waiting.length > 0) {
      jobs.push(this.translateMany(waiting, {
        userInitiated: true,
        checkAvailability: false,
        generation,
      }));
    }
    if (availabilityChecked.length > 0) {
      jobs.push(this.translateMany(availabilityChecked, {
        userInitiated: true,
        checkAvailability: true,
        generation,
      }));
    }
    try {
      await Promise.all(jobs);
    } finally {
      if (this.isActive(generation)) {
        this.recoveryInFlight = false;
        this.scheduleNotice();
      }
    }
  }

  async retranslate(targetIds: readonly string[]): Promise<RetranslationResult> {
    const generation = this.generation;
    if (!this.isActive(generation)) return 'failed';

    const targets = [...new Set(targetIds)]
      .map((id) => this.targets.get(id))
      .filter((target): target is DomTranslationTarget => Boolean(target))
      .filter((target) => target.renderMode !== 'inline')
      .filter((target) => (
        !this.terminalFailures.has(target.id)
        || !this.terminalUserRetries.has(target.id)
      ));
    if (targets.length === 0) {
      return targetIds.some((id) => this.terminalFailures.has(id)) ? 'preserved' : 'failed';
    }
    if (targets.some((target) => this.inFlightTargets.has(target.id))) {
      return 'failed';
    }

    targets.forEach((target) => {
      if (this.terminalFailures.has(target.id)) this.terminalUserRetries.add(target.id);
      this.inFlightTargets.add(target.id);
    });
    try {
      while (this.drainPromise) await this.drainPromise;
      if (!this.isActive(generation)) return 'failed';

      let result: RetranslationResult = 'failed';
      const job = this.retranslateBatch(targets, generation).then((value) => {
        result = value;
      }).finally(() => {
        if (this.drainPromise === job) this.drainPromise = undefined;
      });
      this.drainPromise = job;
      await job;
      return result;
    } finally {
      targets.forEach((target) => this.inFlightTargets.delete(target.id));
    }
  }

  destroy(): void {
    this.stopped = true;
    this.noticeScheduled = false;
    this.recoveryInFlight = false;
    this.options.onNoticeChange?.(undefined);
    this.generation += 1;
    this.observer?.disconnect();
    this.observer = undefined;
    this.disarmUserStartRetry();
    this.visibility.destroy();
    this.visibleComments.clear();
    this.provider.destroy?.();
    this.renderer.destroy();
    this.adapter.restore();
    this.processed.clear();
    this.targets.clear();
    this.ready.clear();
    this.cache.clear();
    this.cacheCharacters = 0;
    this.terminalFailures.clear();
    this.terminalUserRetries.clear();
    this.inFlightTargets.clear();
    // Keep the provider slot until a non-abortable call settles, even across restart.
    this.mutationRecords = [];
    this.mutationScheduled = false;
  }

  private async translateMany(
    targets: DomTranslationTarget[],
    options: TranslateManyOptions = {},
  ): Promise<void> {
    const generation = options.generation ?? this.generation;
    if (!this.isActive(generation)) {
      return;
    }
    const pending = targets.filter((target) => this.processed.get(target.id) !== this.targetRevision(target));
    pending.forEach((target) => {
      const previousSource = this.processed.get(target.id);
      this.processed.set(target.id, this.targetRevision(target));
      this.terminalFailures.delete(target.id);
      this.terminalUserRetries.delete(target.id);
      this.targets.set(target.id, target);
      if (previousSource === undefined) {
        this.renderer.track(target);
      } else {
        this.renderer.reset(target);
      }
      this.record({
        id: target.id,
        category: target.category,
        source: target.semanticSource ?? target.source,
        status: 'pending',
        machine: true,
      });
    });
    const immediate = pending.filter((target) => {
      // Preserve the user gesture when starting a model for an already visible comment.
      if (options.userInitiated && this.visibleComments.has(target.id)) return true;
      this.visibility.remove(target.id);
      this.visibleComments.delete(target.id);
      return !this.visibility.watch(target);
    });
    return this.dispatch(immediate, options);
  }

  private async dispatch(pending: DomTranslationTarget[], options: TranslateManyOptions): Promise<void> {
    const generation = options.generation ?? this.generation;
    if (!this.isActive(generation) || pending.length === 0) {
      return;
    }
    const shouldCheckAvailability = options.checkAvailability ?? !options.userInitiated;
    if (!shouldCheckAvailability) {
      return this.translateQueue(pending, generation);
    }

    let availability: Awaited<ReturnType<TranslationProvider['availability']>>;
    try {
      availability = await this.provider.availability();
    } catch {
      pending.filter((target) => this.isCurrentTarget(target, generation)).forEach((target) => {
        this.record({ id: target.id, category: target.category, source: target.source,
          status: 'failed', machine: true, message: '번역 준비 상태를 확인하지 못했습니다.' });
      });
      return;
    }
    if (!this.isActive(generation)) {
      return;
    }
    if (availability === 'unavailable') {
      pending
        .filter((target) => this.isCurrentTarget(target, generation))
        .forEach((target) => this.markUnsupported(target));
      return;
    }
    if (availability === 'downloadable') {
      pending
        .filter((target) => this.isCurrentTarget(target, generation))
        .forEach((target) => this.markWaitingForUserStart(target));
      return;
    }

    return this.translateQueue(pending, generation);
  }

  private async translateQueue(targets: DomTranslationTarget[], generation: number): Promise<void> {
    for (const target of targets) {
      if (this.isCurrentTarget(target, generation) && this.canTranslate(target)) this.ready.set(target.id, target);
    }
    while (this.isActive(generation) && (this.ready.size || this.drainPromise)) {
      if (!this.drainPromise) {
        // The tracked promise releases the slot before enqueue waiters resume.
        // Recheck ready after every drain so an enqueue at completion cannot be lost.
        const drain = this.drain(generation).finally(() => {
          if (this.drainPromise === drain) this.drainPromise = undefined;
        });
        this.drainPromise = drain;
      }
      await this.drainPromise;
    }
  }

  private async drain(generation: number): Promise<void> {
    while (this.ready.size && this.isActive(generation)) {
      const batch: DomTranslationTarget[] = [];
      for (const target of this.ready.values()) {
        batch.push(target);
        if (batch.length === 32) break;
      }
      for (const target of batch) {
        if (!this.isActive(generation)) return;
        if (this.ready.get(target.id) !== target) continue;
        this.ready.delete(target.id);
        await this.translateTarget(target, generation);
      }
      if (this.ready.size) await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }

  private contextFor(target: DomTranslationTarget): TranslationContextMetadata {
    const policy = this.options.textPolicy;
    return {
      category: target.contextCategory ?? target.category,
      pageKind: this.options.pageKind ?? 'unknown',
      ...(target.sectionHeading ? { sectionHeading: target.sectionHeading } : {}),
      policyVersion: policy?.policyVersion ?? 'none',
      glossaryVersion: policy?.glossaryVersion ?? 'none',
    };
  }

  private prepare(
    target: DomTranslationTarget,
    context: TranslationContextMetadata,
    source = target.source,
    protectedReplacements: readonly TextReplacement[] | undefined = target.format?.protectedReplacements,
  ): PreparedTranslation {
    const prepared = this.options.textPolicy?.prepare({
      text: source,
      context,
      trustedValues: target.trustedValues ?? [],
      protectedReplacements,
    }) ?? {
      text: source,
      cacheDiscriminator: 'plain',
      metrics: {
        sourceCharacters: source.length,
        protectedSpans: 0,
        glossarySpans: 0,
      },
      restore: (translated: string) => translated,
    };
    this.metrics.preparedCharacters += prepared.metrics.sourceCharacters;
    this.metrics.protectedSpans += prepared.metrics.protectedSpans;
    this.metrics.glossarySpans += prepared.metrics.glossarySpans;
    return prepared;
  }

  private cacheKey(
    source: string,
    context: TranslationContextMetadata,
    preparations: readonly PreparedTranslation[],
  ): string {
    return JSON.stringify([
      this.provider.id,
      'en',
      'ko',
      context.pageKind,
      context.category,
      context.sectionHeading ?? '',
      context.policyVersion,
      context.glossaryVersion,
      preparations.map((preparation) => [
        preparation.cacheDiscriminator,
        preparation.text,
      ]),
      source,
    ]);
  }

  private remember(key: string, value: string): void {
    const size = key.length + value.length;
    if (size > 524288) return;
    const previous = this.cache.get(key);
    if (previous !== undefined) this.cacheCharacters -= key.length + previous.length;
    this.cache.delete(key);
    this.cache.set(key, value);
    this.cacheCharacters += size;
    while (this.cache.size > 500 || this.cacheCharacters > 524288) {
      const oldest = this.cache.entries().next().value;
      if (!oldest) break;
      this.cache.delete(oldest[0]);
      this.cacheCharacters -= oldest[0].length + oldest[1].length;
    }
  }

  private pruneDisconnected(): void {
    for (const [id, target] of this.targets) {
      if (target.sourceElements.some((element) => element.isConnected)) continue;
      this.ready.delete(id);
      this.targets.delete(id);
      this.processed.delete(id);
      this.ledger.delete(id);
      this.scheduleNotice();
      this.renderer.remove?.(id);
      this.visibility.remove(id);
      this.visibleComments.delete(id);
      this.terminalFailures.delete(id);
      this.terminalUserRetries.delete(id);
    }
  }

  private async translateTarget(target: DomTranslationTarget, generation: number): Promise<void> {
    if (!this.isCurrentTarget(target, generation)
      || !this.canTranslate(target)
      || this.inFlightTargets.has(target.id)) {
      return;
    }
    this.inFlightTargets.add(target.id);
    try {
      const { cacheKey, translated } = await this.resolveTranslation(target);
      if (!this.isCurrentTarget(target, generation)) {
        return;
      }
      this.renderer.render(target, translated);
      this.remember(cacheKey, translated);
      this.record({
        id: target.id,
        category: target.category,
        source: target.semanticSource ?? target.source,
        translated,
        status: 'translated',
        machine: true,
      });
    } catch (error) {
      if (!this.isCurrentTarget(target, generation)) {
        return;
      }
      this.renderer.reset(target);
      if (isUserStartRequiredError(error)) {
        this.markWaitingForUserStart(target);
        return;
      }
      if (isProviderUnavailableError(error)) {
        this.markUnsupported(target);
        return;
      }
      this.handleFailure(target, error);
    } finally {
      this.inFlightTargets.delete(target.id);
    }
  }

  private async retranslateBatch(
    targets: DomTranslationTarget[],
    generation: number,
  ): Promise<RetranslationResult> {
    let currentTarget: DomTranslationTarget | undefined;
    try {
      const resolved: Array<{ target: DomTranslationTarget; result: ResolvedTranslation }> = [];
      for (const target of targets) {
        currentTarget = target;
        if (!this.isCurrentTarget(target, generation)) {
          return 'failed';
        }
        resolved.push({
          target,
          result: await this.resolveTranslation(target, true),
        });
      }
      if (!resolved.every(({ target }) => this.isCurrentTarget(target, generation))) {
        return 'failed';
      }

      const unchanged = resolved.every(({ target, result }) => (
        this.ledger.get(target.id)?.translated === result.translated
      ));
      resolved.forEach(({ target, result }) => {
        currentTarget = target;
        this.renderer.render(target, result.translated);
        this.terminalFailures.delete(target.id);
        this.terminalUserRetries.delete(target.id);
        this.remember(result.cacheKey, result.translated);
        this.record({
          id: target.id,
          category: target.category,
          source: target.semanticSource ?? target.source,
          translated: result.translated,
          status: 'translated',
          machine: true,
        });
      });
      return unchanged ? 'unchanged' : 'updated';
    } catch (error) {
      if (currentTarget && this.isCurrentTarget(currentTarget, generation)) {
        this.handleFailure(currentTarget, error);
      }
      return error instanceof PlaceholderIntegrityError ? 'preserved' : 'failed';
    }
  }

  private handleFailure(target: DomTranslationTarget, error: unknown): void {
    const preserved = error instanceof PlaceholderIntegrityError;
    if (preserved) {
      this.terminalFailures.add(target.id);
      this.metrics.integrityFailures += 1;
    } else {
      this.terminalFailures.delete(target.id);
      this.terminalUserRetries.delete(target.id);
    }
    if (this.ledger.get(target.id)?.translated) return;

    const message = preserved ? error.message : userFacingFailureMessage(error);
    this.record({
      id: target.id,
      category: target.category,
      source: target.semanticSource ?? target.source,
      status: preserved ? 'preserved' : 'failed',
      machine: true,
      message,
    });
    if (preserved) this.renderer.preserveOriginal?.(target);
    else this.renderer.showFailure?.(target, message);
  }

  private async resolveTranslation(
    target: DomTranslationTarget,
    bypassCache = false,
    retryByLine = false,
  ): Promise<ResolvedTranslation> {
    const context = this.contextFor(target);
    const parts: readonly DomTranslationParagraphPart[] = target.format && (target.category === 'comment' || retryByLine)
      ? splitDomTranslationParagraphs(target.source, target.format, retryByLine ? 'line' : 'paragraph')
      : [{
          kind: 'translate',
          source: target.source,
          protectedReplacements: target.format?.protectedReplacements ?? [],
        }];
    const preparations = parts.flatMap((part) => (
      part.kind === 'translate'
        ? [this.prepare(target, context, part.source, part.protectedReplacements)]
        : []
    ));
    const cacheKey = this.cacheKey(target.source, context, preparations);
    const cached = bypassCache ? undefined : this.cache.get(cacheKey);
    if (cached !== undefined) this.metrics.cacheHits += 1;
    let translated = cached;
    if (translated === undefined) {
      const translatePrepared = async (prepared: PreparedTranslation): Promise<string> => {
        const request: TranslationRequest = {
          sourceLanguage: 'en',
          targetLanguage: 'ko',
          text: prepared.text,
          context,
        };
        this.metrics.providerCalls += 1;
        return prepared.restore(await this.provider.translate(request));
      };
      let preparationIndex = 0;
      const translatedParts: string[] = [];
      try {
        for (const part of parts) {
          if (part.kind === 'separator') {
            translatedParts.push(part.source);
            continue;
          }
          const preparation = preparations[preparationIndex++]!;
          try {
            translatedParts.push(await translatePrepared(preparation));
          } catch (error) {
            if (!(error instanceof PlaceholderIntegrityError)
              || !preparation.fallback
              || error.failedKinds.some((kind) => kind !== 'glossary')) throw error;
            this.metrics.integrityFailures += 1;
            this.metrics.glossaryFallbacks += 1;
            translatedParts.push(await translatePrepared(preparation.fallback));
          }
        }
        translated = translatedParts.join('');
      } catch (error) {
        // A model can lose adjacent BR markers in otherwise valid prose. Retry
        // once at existing root-level line breaks; never infer missing tokens or
        // split inside a link/emphasis/list. Only a complete result is rendered.
        const lineParts = !retryByLine && target.format
          && error instanceof PlaceholderIntegrityError && error.failedKinds.includes('protected')
          ? splitDomTranslationParagraphs(target.source, target.format, 'line')
          : [];
        if (lineParts.filter((part) => part.kind === 'translate').length
          <= parts.filter((part) => part.kind === 'translate').length) throw error;
        this.metrics.integrityFailures += 1;
        translated = (await this.resolveTranslation(target, bypassCache, true)).translated;
      }
    }
    if (!translated.trim() || translated === target.source) {
      throw new Error('번역 결과가 비어 있거나 원문과 같습니다.');
    }
    return { cacheKey, translated };
  }

  private targetRevision(target: DomTranslationTarget): string {
    return `${target.format?.fingerprint ?? 'plain'}\0${target.source}`;
  }

  private markWaitingForUserStart(target: DomTranslationTarget): void {
    this.record({
      id: target.id,
      category: target.category,
      source: target.semanticSource ?? target.source,
      status: 'waiting-user-start',
      machine: true,
      message: USER_START_REQUIRED_MESSAGE,
    });
    this.armUserStartRetry();
  }

  private readonly handleUserStartRetry = (event: Event): void => {
    if (event.target instanceof Element && event.target.closest('.mpkr-translation-notice')) return;
    this.disarmUserStartRetry();
    void this.retry();
  };

  private armUserStartRetry(): void {
    if (this.userStartRetryArmed || this.stopped) {
      return;
    }
    this.userStartRetryArmed = true;
    document.addEventListener('click', this.handleUserStartRetry, true);
    document.addEventListener('keydown', this.handleUserStartRetry, true);
  }

  private disarmUserStartRetry(): void {
    if (!this.userStartRetryArmed) {
      return;
    }
    this.userStartRetryArmed = false;
    document.removeEventListener('click', this.handleUserStartRetry, true);
    document.removeEventListener('keydown', this.handleUserStartRetry, true);
  }

  private markUnsupported(target: DomTranslationTarget): void {
    this.record({
      id: target.id,
      category: target.category,
      source: target.semanticSource ?? target.source,
      status: 'unsupported',
      machine: true,
      message: UNSUPPORTED_MESSAGE,
    });
  }

  private record(record: TranslationRecord): void {
    this.ledger.upsert(record);
    this.scheduleNotice();
  }

  private scheduleNotice(): void {
    if (!this.options.onNoticeChange || this.stopped || this.noticeScheduled) return;
    this.noticeScheduled = true;
    const generation = this.generation;
    queueMicrotask(() => {
      if (!this.isActive(generation)) return;
      this.noticeScheduled = false;
      const entries = [...this.targets.values()].flatMap((target) => {
        const anchor = target.sourceElements.find((element) => element.isConnected);
        const record = this.ledger.get(target.id);
        return anchor && record ? [{ target, anchor, record }] : [];
      });
      const waiting = entries.find(({ record }) => record.status === 'waiting-user-start');
      const unsupported = entries.find(({ record }) => record.status === 'unsupported');
      const failed = entries.find(({ target, record }) => record.status === 'failed'
        && !this.renderer.hasFailureNotice?.(target));
      const problem = waiting ?? unsupported ?? failed;
      if (this.recoveryInFlight && entries.length) {
        this.options.onNoticeChange?.({ kind: 'preparing', anchor: entries[0]!.anchor, retryable: false });
      } else if (problem) {
        const retryable = entries.some(({ target, record }) =>
          (record.status === 'failed' || record.status === 'waiting-user-start')
          && !this.terminalFailures.has(target.id));
        this.options.onNoticeChange?.({
          kind: waiting ? 'waiting' : unsupported ? 'unsupported' : 'failed',
          anchor: problem.anchor, retryable,
        });
      } else {
        this.options.onNoticeChange?.(undefined);
      }
    });
  }

  private isActive(generation: number): boolean {
    return !this.stopped && generation === this.generation;
  }

  private canTranslate(target: DomTranslationTarget): boolean {
    return target.category !== 'comment' || typeof IntersectionObserver === 'undefined'
      || this.visibleComments.has(target.id);
  }

  private isCurrentTarget(target: DomTranslationTarget, generation: number): boolean {
    return this.isActive(generation)
      && this.targets.get(target.id) === target
      && target.sourceElements.some((element) => element.isConnected)
      && this.processed.get(target.id) === this.targetRevision(target);
  }
}
