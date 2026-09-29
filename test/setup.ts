// happy-dom's observer does not perform layout. Visibility tests supply entries explicitly.
Object.defineProperty(globalThis, 'IntersectionObserver', { value: undefined, writable: true, configurable: true });
