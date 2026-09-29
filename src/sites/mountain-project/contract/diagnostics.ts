import type { ContractDiagnostic } from './schema';

export type ContractDiagnosticSink = (diagnostic: ContractDiagnostic) => void;

export function createContractDiagnosticReporter(
  logger: Pick<Console, 'warn'> = console,
): ContractDiagnosticSink {
  const reported = new Set<string>();
  return (diagnostic) => {
    const { page, ...details } = diagnostic;
    let sanitized: ContractDiagnostic = details;
    if (page) {
      try {
        const url = new URL(page);
        url.search = '';
        url.hash = '';
        url.username = '';
        url.password = '';
        sanitized = { ...details, page: url.href };
      } catch {
        // An unparseable page must not expose its raw query or fragment.
      }
    }
    // DOM observers may retry while a page is assembling. One warning per
    // component and page keeps the console actionable instead of noisy.
    const fingerprint = [sanitized.component, sanitized.page ?? 'unknown-page'].join(':');
    if (reported.has(fingerprint)) {
      return;
    }
    reported.add(fingerprint);
    logger.warn(
      `[MPKR contract] ${diagnostic.component}/${diagnostic.key}: ${diagnostic.reason}`,
      sanitized,
    );
  };
}
