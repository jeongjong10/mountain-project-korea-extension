export interface ExtensionSettings {
  enabled: boolean;
  /** True only when no enabled preference has ever been persisted. */
  isFirstRun?: boolean;
}

export interface SettingsRepository {
  get(): Promise<ExtensionSettings>;
  setEnabled(enabled: boolean): Promise<void>;
  watch(listener: (settings: ExtensionSettings) => void): () => void;
}
