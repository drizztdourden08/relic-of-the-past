/* @layer renderer-stores @kind types */
interface JapanesePieces {
  menus: boolean;
  pause: boolean;
  ending: boolean;
}

interface JapaneseGraphicsStatus extends JapanesePieces {
  available: boolean;
  fontImported: boolean;
}

interface JapaneseGraphicsStore extends JapaneseGraphicsStatus {
  setStatus: (status: JapaneseGraphicsStatus) => void;
}

export type { JapaneseGraphicsStore, JapanesePieces };
