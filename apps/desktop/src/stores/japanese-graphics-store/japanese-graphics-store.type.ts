/* @layer renderer-stores @kind types */
interface JapaneseGraphicsStatus {
  available: boolean;
  fontImported: boolean;
}

interface JapaneseGraphicsStore extends JapaneseGraphicsStatus {
  setStatus: (status: JapaneseGraphicsStatus) => void;
}

export type { JapaneseGraphicsStatus, JapaneseGraphicsStore };
