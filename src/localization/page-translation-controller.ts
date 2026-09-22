import {
  MountainProjectPageAdapter,
  type DomTranslationTarget,
} from '../adapters/mountain-project-page-adapter';
import type { TranslationProvider } from '../core/translation-provider';
import {
  TranslationLedger,
  type TranslationRecord,
} from '../core/translation-record';
import { OriginalPreservingRenderer } from '../rendering/original-preserving-renderer';

interface TranslateManyOptions {
  userInitiated?: boolean;
  checkAvailability?: boolean;
  generation?: number;
}

const USER_START_REQUIRED_MESSAGE = '브라우저 번역 언어팩 준비를 기다리고 있습니다. 다음 페이지 상호작용에서 자동으로 다시 시도합니다.';
const UNSUPPORTED_MESSAGE = '현재 이 브라우저에서는 페이지 본문 번역 엔진을 사용할 수 없습니다. 원문을 유지합니다.';
const EXTENSION_CONTENT_SELECTOR = [
  '.mpkr-machine-translation',
  '.mpkr-original-section-content',
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
  private stopped = false;
  private generation = 0;

  constructor(
    private readonly provider: TranslationProvider,
    readonly ledger: TranslationLedger,
    private readonly adapter = new MountainProjectPageAdapter(),
    private readonly renderer = new OriginalPreservingRenderer(),
  ) {}

  isSouthKoreaPage(url: URL): boolean {
    return this.adapter.isSouthKoreaPage(url);
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
      const targets = [
        ...this.adapter.collectPageTargets(),
        ...this.adapter.collectCommentTargets(),
      ];
      void this.translateMany(targets, { generation });
    });
    this.observer.observe(document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    await this.translateMany(targets, { generation });
  }

  registerExternal(record: TranslationRecord): void {
    this.ledger.upsert(record);
  }

  async retry(): Promise<void> {
    const generation = this.generation;
    if (!this.isActive(generation)) {
      return;
    }

    const retryable = this.ledger.snapshot()
      .filter((record) => (
        record.status === 'waiting-user-start'
        || record.status === 'failed'
        || record.status === 'unsupported'
      ))
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
    await Promise.all(jobs);
  }

  destroy(): void {
    this.stopped = true;
    this.generation += 1;
    this.observer?.disconnect();
    this.observer = undefined;
    this.disarmUserStartRetry();
    this.provider.destroy?.();
    this.renderer.destroy();
    this.adapter.restore();
    this.processed.clear();
    this.targets.clear();
  }

  private async translateMany(
    targets: DomTranslationTarget[],
    options: TranslateManyOptions = {},
  ): Promise<void> {
    const generation = options.generation ?? this.generation;
    if (!this.isActive(generation)) {
      return;
    }
    const pending = targets.filter((target) => this.processed.get(target.id) !== target.source);
    pending.forEach((target) => {
      const previousSource = this.processed.get(target.id);
      this.processed.set(target.id, target.source);
      this.targets.set(target.id, target);
      if (previousSource === undefined) {
        this.renderer.track(target);
      } else {
        this.renderer.reset(target);
      }
      this.ledger.upsert({
        id: target.id,
        category: target.category,
        source: target.source,
        status: 'pending',
        machine: true,
      });
    });
    if (pending.length === 0) {
      return;
    }
    const shouldCheckAvailability = options.checkAvailability ?? !options.userInitiated;
    if (!shouldCheckAvailability) {
      return this.translateQueue(pending, generation);
    }

    const availability = await this.provider.availability();
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
    const queue = [...targets];
    const workers = Array.from({ length: Math.min(3, queue.length) }, async () => {
      while (queue.length > 0 && this.isActive(generation)) {
        const target = queue.shift();
        if (target) {
          await this.translateTarget(target, generation);
        }
      }
    });
    await Promise.all(workers);
  }

  private async translateTarget(target: DomTranslationTarget, generation: number): Promise<void> {
    if (!this.isCurrentTarget(target, generation)) {
      return;
    }
    try {
      const translated = (await this.provider.translate({
        sourceLanguage: 'en',
        targetLanguage: 'ko',
        text: target.source,
      })).trim();
      if (!this.isCurrentTarget(target, generation)) {
        return;
      }
      if (!translated || translated === target.source) {
        throw new Error('번역 결과가 비어 있거나 원문과 같습니다.');
      }
      this.renderer.render(target, translated);
      this.ledger.upsert({
        id: target.id,
        category: target.category,
        source: target.source,
        translated,
        status: 'translated',
        machine: true,
      });
    } catch (error) {
      if (!this.isCurrentTarget(target, generation)) {
        return;
      }
      if (isUserStartRequiredError(error)) {
        this.markWaitingForUserStart(target);
        return;
      }
      if (isProviderUnavailableError(error)) {
        this.markUnsupported(target);
        return;
      }
      this.ledger.upsert({
        id: target.id,
        category: target.category,
        source: target.source,
        status: 'failed',
        machine: true,
        message: error instanceof Error ? error.message : '번역에 실패해 원문을 유지합니다.',
      });
    }
  }

  private markWaitingForUserStart(target: DomTranslationTarget): void {
    this.ledger.upsert({
      id: target.id,
      category: target.category,
      source: target.source,
      status: 'waiting-user-start',
      machine: true,
      message: USER_START_REQUIRED_MESSAGE,
    });
    this.armUserStartRetry();
  }

  private readonly handleUserStartRetry = (): void => {
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
    this.ledger.upsert({
      id: target.id,
      category: target.category,
      source: target.source,
      status: 'unsupported',
      machine: true,
      message: UNSUPPORTED_MESSAGE,
    });
  }

  private isActive(generation: number): boolean {
    return !this.stopped && generation === this.generation;
  }

  private isCurrentTarget(target: DomTranslationTarget, generation: number): boolean {
    return this.isActive(generation)
      && this.processed.get(target.id) === target.source;
  }
}
