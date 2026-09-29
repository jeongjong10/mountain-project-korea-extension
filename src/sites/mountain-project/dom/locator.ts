import type {
  ContractDiagnostic,
  LocatorAttempt,
  LocatorFailure,
  LocatorResult,
  SelectorContract,
} from '../contract/schema';

type Validator<T extends Element> = (element: T) => boolean;

export function locateFirst<T extends Element>(
  root: ParentNode,
  contract: SelectorContract,
  validate: Validator<T> = () => true,
  page?: string,
): LocatorResult<T> {
  const attempts: LocatorAttempt[] = [];
  for (const [index, candidate] of contract.candidates.entries()) {
    const matches = Array.from(root.querySelectorAll<T>(candidate.selector));
    if (matches.length === 0) {
      attempts.push({
        candidate: candidate.key,
        selector: candidate.selector,
        outcome: 'missing',
      });
      continue;
    }
    const match = matches.find(validate);
    if (!match) {
      attempts.push({
        candidate: candidate.key,
        selector: candidate.selector,
        outcome: 'invalid',
        reason: 'Elements matched, but required landmarks or relationships were absent.',
      });
      continue;
    }
    attempts.push({
      candidate: candidate.key,
      selector: candidate.selector,
      outcome: 'matched',
    });
    return {
      ok: true,
      value: match,
      metadata: {
        component: contract.component,
        key: contract.key,
        candidate: candidate.key,
        fallback: index > 0,
        attempts,
      },
    };
  }
  return locatorFailure(
    contract.component,
    contract.key,
    'Required Mountain Project landmark was not found.',
    attempts,
    page,
  );
}

export function locatorFailure(
  component: string,
  key: string,
  reason: string,
  attempts: readonly LocatorAttempt[] = [],
  page?: string,
): LocatorFailure {
  const diagnostic: ContractDiagnostic = {
    component,
    key,
    reason,
    ...(page ? { page } : {}),
    ...(attempts.length > 0
      ? { attemptedSelectors: attempts.map(({ selector }) => selector) }
      : {}),
  };
  return { ok: false, diagnostic, attempts };
}

export function directChildContaining(
  parent: Element,
  descendant: Element,
): HTMLElement | undefined {
  return Array.from(parent.children).find(
    (child): child is HTMLElement => (
      child instanceof HTMLElement && child.contains(descendant)
    ),
  );
}

export function closestWithin(
  start: Element,
  boundary: Element,
  predicate: (candidate: HTMLElement) => boolean,
): HTMLElement | undefined {
  let candidate: Element | null = start;
  while (candidate && boundary.contains(candidate)) {
    if (candidate instanceof HTMLElement && predicate(candidate)) {
      return candidate;
    }
    if (candidate === boundary) {
      break;
    }
    candidate = candidate.parentElement;
  }
  return undefined;
}

export function mergeLocatorFailure<T>(
  result: LocatorResult<T>,
): ContractDiagnostic | undefined {
  return result.ok ? undefined : result.diagnostic;
}
