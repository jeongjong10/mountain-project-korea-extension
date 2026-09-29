import { HELP_SELECTORS } from '../sites/mountain-project/contract/selectors/help';
import { translateHelpUi } from '../sites/mountain-project/contract/text/help';

interface OptionLabelState {
  original: string | null;
  translated: string;
}

/** Runs inside the direct localizer's existing mutation cycle. */
export class HelpHubLocalizer {
  private readonly optionLabels = new Map<HTMLOptionElement, OptionLabelState>();

  apply(root: ParentNode): void {
    const document = root.nodeType === Node.DOCUMENT_NODE ? root as Document : root.ownerDocument;
    if (!document?.querySelector(HELP_SELECTORS.hubPage)) return;

    document.querySelectorAll<HTMLOptionElement>(HELP_SELECTORS.hubCategoryOptions).forEach((option) => {
      if (option.hasAttribute('value')) return;
      const state = this.optionLabels.get(option);
      const label = option.getAttribute('label');
      const original = state && label === state.translated ? state.original : label;
      const translated = translateHelpUi(original ?? option.textContent ?? '');
      if (!translated) {
        if (state && label === state.translated) this.restoreLabel(option, original);
        this.optionLabels.delete(option);
        return;
      }
      this.optionLabels.set(option, { original, translated });
      // Without an explicit value, option text is also the API category value.
      if (label !== translated) option.label = translated;
    });

    const label = document.querySelector(HELP_SELECTORS.hubCategoryLabel)?.textContent?.trim();
    if (!label) return;
    const selected = translateHelpUi(label) ?? label;
    document.querySelectorAll<HTMLElement>(HELP_SELECTORS.hubCategoryFilters).forEach((button) => {
      const text = button.textContent?.trim() ?? '';
      const active = (translateHelpUi(text) ?? text) === selected;
      // The site's setWlCat compares button text to an untranslated category.
      if (button.classList.contains('active') !== active) button.classList.toggle('active', active);
    });
  }

  restore(): void {
    this.optionLabels.forEach((state, option) => {
      if (option.getAttribute('label') === state.translated) this.restoreLabel(option, state.original);
    });
    this.optionLabels.clear();
  }

  private restoreLabel(option: HTMLOptionElement, label: string | null): void {
    if (label === null) option.removeAttribute('label');
    else option.setAttribute('label', label);
  }
}
