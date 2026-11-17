/* @layer renderer-stores @kind types */
interface JapaneseGraphicsStore {
  available: boolean;
  setAvailable: (available: boolean) => void;
}

export type { JapaneseGraphicsStore };
