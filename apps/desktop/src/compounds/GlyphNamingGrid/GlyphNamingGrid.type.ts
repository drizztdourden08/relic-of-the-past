/* @layer renderer-components @kind types */
interface GlyphNamingItem {
  token: string;
  glyph: number;
  count: number;
}

interface GlyphNamingGridProps {
  items: readonly GlyphNamingItem[];
  names: Readonly<Record<string, string>>;
  problems: Readonly<Record<string, string>>;
  tiles: Uint8Array | null;
  readOnly: boolean;
  canSave: boolean;
  onNameChange: (token: string, value: string) => void;
  onSave: () => void;
}

interface GlyphNamingCellProps {
  item: GlyphNamingItem;
  name: string;
  problem: string | undefined;
  tiles: Uint8Array | null;
  readOnly: boolean;
  onNameChange: (token: string, value: string) => void;
}

export type { GlyphNamingCellProps, GlyphNamingGridProps, GlyphNamingItem };
