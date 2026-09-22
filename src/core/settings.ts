export interface ExtensionSettings {
  enabled: boolean;
}

export interface SettingsRepository {
  get(): Promise<ExtensionSettings>;
  setEnabled(enabled: boolean): Promise<void>;
  watch(listener: (settings: ExtensionSettings) => void): () => void;
}
