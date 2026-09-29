export type TranslationCategory =
  | 'ui'
  | 'name'
  | 'description'
  | 'access'
  | 'safety'
  | 'comment';

export type TranslationStatus =
  | 'pending'
  | 'waiting-user-start'
  | 'translated'
  | 'preserved'
  | 'failed'
  | 'unsupported';

export interface TranslationRecord {
  id: string;
  category: TranslationCategory;
  source: string;
  translated?: string;
  status: TranslationStatus;
  machine: boolean;
  message?: string;
}

export class TranslationLedger {
  private readonly records = new Map<string, TranslationRecord>();

  upsert(record: TranslationRecord): void {
    this.records.set(record.id, record);
  }

  get(id: string): TranslationRecord | undefined {
    return this.records.get(id);
  }

  delete(id: string): void {
    this.records.delete(id);
  }

  snapshot(): TranslationRecord[] {
    return Array.from(this.records.values());
  }

  clear(): void {
    this.records.clear();
  }
}
