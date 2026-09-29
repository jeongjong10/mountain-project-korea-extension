export interface SelectorCandidate {
  readonly key: string;
  readonly selector: string;
}

export interface SelectorContract {
  readonly component: string;
  readonly key: string;
  readonly candidates: readonly SelectorCandidate[];
  readonly required: boolean;
}

export interface LocatorAttempt {
  readonly candidate: string;
  readonly selector: string;
  readonly outcome: 'missing' | 'invalid' | 'matched';
  readonly reason?: string;
}

export interface LocatorMetadata {
  readonly component: string;
  readonly key: string;
  readonly candidate: string;
  readonly fallback: boolean;
  readonly attempts: readonly LocatorAttempt[];
}

export interface ContractDiagnostic {
  readonly component: string;
  readonly key: string;
  readonly reason: string;
  readonly page?: string;
  readonly attemptedSelectors?: readonly string[];
}

export interface LocatorSuccess<T> {
  readonly ok: true;
  readonly value: T;
  readonly metadata: LocatorMetadata;
}

export interface LocatorFailure {
  readonly ok: false;
  readonly diagnostic: ContractDiagnostic;
  readonly attempts: readonly LocatorAttempt[];
}

export type LocatorResult<T> = LocatorSuccess<T> | LocatorFailure;

export interface ContractHealth {
  readonly healthy: boolean;
  readonly fallback: boolean;
  readonly diagnostics: readonly ContractDiagnostic[];
}
