import type { TranslationCategory } from '../core/translation-record';
import type { TranslationContextCategory } from '../core/translation-provider';
import type { DomTranslationFormat } from '../rendering/dom-translation-format';

// Settings is a DOM-free core port, re-exported here for runtime consumers.
export type { ExtensionSettings, SettingsRepository } from '../core/settings';

export interface DomTranslationTarget {
  id: string;
  category: Exclude<TranslationCategory, 'ui' | 'name'>;
  source: string;
  semanticSource?: string;
  sourceElements: HTMLElement[];
  insertBefore?: ChildNode | null;
  parent: HTMLElement;
  /** Keep translation buttons outside a surrounding navigation link. */
  actionPlacement?: { parent: HTMLElement; insertBefore?: ChildNode | null };
  renderMode?: 'block' | 'inline' | 'inline-copy';
  format?: DomTranslationFormat;
  contextCategory?: TranslationContextCategory;
  sectionHeading?: string;
  trustedValues?: readonly string[];
}

export interface TranslationPageAdapter {
  collectPageTargets(root?: ParentNode): DomTranslationTarget[];
  collectCommentTargets(root?: ParentNode): DomTranslationTarget[];
  mutationRoots?(records: MutationRecord[]): ParentNode[];
  restore(): void;
}

export interface TranslationRenderer {
  track(target: DomTranslationTarget): void;
  reset(target: DomTranslationTarget): void;
  render(target: DomTranslationTarget, translated: string): void;
  showFailure?(target: DomTranslationTarget, message: string): void;
  preserveOriginal?(target: DomTranslationTarget): void;
  hasFailureNotice?(target: DomTranslationTarget): boolean;
  setRetranslateHandler?(handler: RetranslateHandler): void;
  remove?(id: string): void;
  destroy(): void;
}

export type RetranslationResult = 'updated' | 'unchanged' | 'preserved' | 'failed';
export type RetranslateHandler = (
  targetIds: readonly string[],
) => Promise<RetranslationResult>;

export interface PageLifecycle {
  enable(): void;
  disable(): void;
  destroy(): void;
}
