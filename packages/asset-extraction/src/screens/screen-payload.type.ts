/* @layer shared-asset-extraction @kind types */
type SelectFileTable =
  | 'gfx0' | 'nameStripes' | 'copySelect' | 'copyBlinker' | 'copyTargetTab0' | 'copyTargetTab2'
  | 'killTarget' | 'killTargetTab2';

type PauseTable =
  | 'ability' | 'gloves' | 'bottles' | 'mushroom' | 'flute' | 'mirror' | 'bow' | 'items' | 'dungeonItems';

type SheetKind = 'spr' | 'bg';

interface SheetOverride {
  readonly kind: SheetKind;
  readonly index: number;
  readonly data: Uint8Array;
}

interface ScreenPayload {
  readonly menuTilemaps: readonly Uint8Array[];
  readonly selectFileStripes: Readonly<Record<SelectFileTable, Uint8Array>>;
  readonly nameGrid: Uint16Array;
  readonly pauseText: Readonly<Record<PauseTable, Uint16Array>>;
  readonly dungeonMapLabels: Uint16Array;
  readonly endingCaptions: { readonly offsets: Uint16Array; readonly data: Uint8Array };
  readonly credits: { readonly text: Uint8Array; readonly offsets: Uint16Array; readonly map: Uint16Array };
  readonly sheets: readonly SheetOverride[];
  readonly tilemapFont: number;
  readonly tilemapFontData?: Uint8Array;
}

interface TableRegion {
  readonly address: number;
  readonly count: number;
}

interface ScreenAddressTable {
  readonly id: 'us' | 'de' | 'fr' | 'fr-c' | 'en' | 'ja-v1.0' | 'ja-rev1';
  readonly menuTilemaps: readonly number[];
  readonly selectFile: Readonly<Record<SelectFileTable, TableRegion>>;
  readonly nameGrid: TableRegion;
  readonly pauseText: Readonly<Record<PauseTable, TableRegion>>;
  readonly dungeonMapLabels: TableRegion;
  readonly endingCaptions: { readonly offsets: TableRegion; readonly data: TableRegion };
  readonly credits: { readonly text: TableRegion; readonly offsets: TableRegion; readonly map: TableRegion };
  readonly sheetPointers: { readonly spr: number; readonly bg: number };
  readonly sheets: { readonly spr: readonly number[]; readonly bg: readonly number[] };
}

export type { PauseTable, ScreenAddressTable, ScreenPayload, SelectFileTable, SheetKind, SheetOverride, TableRegion };
