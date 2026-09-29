export function connectEmbeddedFormNavigation(
  document: Document,
  isInformationNavigation: (url: URL) => boolean,
): () => void {
  const view = document.defaultView;
  if (!view) {
    return () => {};
  }
  const pending = new Map<HTMLFormElement, () => void>();

  const handleSubmit = (event: SubmitEvent): void => {
    const form = event.target as HTMLFormElement | null;
    if (form?.tagName !== 'FORM') {
      return;
    }
    pending.get(form)?.();
    if (event.defaultPrevented) {
      return;
    }

    const restorations: Array<() => void> = [];
    let finish: ((event: Event) => void) | undefined;
    const setTemporaryAttribute = (element: Element, name: string, value: string): void => {
      const original = element.getAttribute(name);
      if (original === value) {
        return;
      }
      element.setAttribute(name, value);
      restorations.push(() => {
        if (element.getAttribute(name) !== value) {
          return;
        }
        if (original === null) {
          element.removeAttribute(name);
        } else {
          element.setAttribute(name, original);
        }
      });
    };

    const handleFormData = (dataEvent: Event): void => {
      // A FormData constructor inside a submit handler is not the native default action.
      if (dataEvent.target !== form || event.eventPhase !== 0 || event.defaultPrevented) {
        return;
      }
      document.removeEventListener('formdata', handleFormData);
      // Register at the end of bubbling so existing site formdata handlers run first.
      finish = (completedEvent): void => {
        if (completedEvent !== dataEvent || event.defaultPrevented) {
          return;
        }
        const submitter = event.submitter;
        const method = submitter?.getAttribute('formmethod')
          ?? form.getAttribute('method') ?? 'get';
        // Missing and invalid method keywords have the native GET default.
        if (/^(?:post|dialog)$/i.test(method)) {
          return;
        }
        const action = submitter?.getAttribute('formaction')
          ?? form.getAttribute('action');
        let url: URL;
        try {
          url = new URL(action || document.URL, document.baseURI);
        } catch {
          return;
        }
        if (!/^https?:$/.test(url.protocol) || !isInformationNavigation(url)) {
          return;
        }
        const targetOwner = submitter?.hasAttribute('formtarget') ? submitter : form;
        setTemporaryAttribute(targetOwner, targetOwner === form ? 'target' : 'formtarget', '_blank');
        const rel = form.getAttribute('rel') ?? '';
        if (!rel.split(/[\t\n\f\r ]+/).some((token) => token.toLowerCase() === 'noopener')) {
          setTemporaryAttribute(form, 'rel', rel ? `${rel} noopener` : 'noopener');
        }
      };
      view.addEventListener('formdata', finish, { once: true });
    };

    const cleanup = (): void => {
      clearTimeout(timer);
      document.removeEventListener('formdata', handleFormData);
      if (finish) {
        view.removeEventListener('formdata', finish);
      }
      restorations.forEach((restore) => restore());
      pending.delete(form);
    };
    // The browser reads target/rel after formdata returns; a microtask is too early.
    const timer = setTimeout(cleanup, 0);
    pending.set(form, cleanup);
    document.addEventListener('formdata', handleFormData);
  };

  document.addEventListener('submit', handleSubmit, true);
  return () => {
    document.removeEventListener('submit', handleSubmit, true);
    pending.forEach((cleanup) => cleanup());
  };
}
