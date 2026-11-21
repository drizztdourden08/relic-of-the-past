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

interface SheetPatch {
  readonly index: number;
  readonly tiles: readonly number[];
  readonly data: Uint8Array;
}

interface SheetPatchSource {
  readonly index: number;
  readonly tiles: readonly number[];
}

interface ScreenPayload {
  readonly menuTilemaps: readonly Uint8Array[];
  readonly selectFileStripes: Readonly<Record<SelectFileTable, Uint8Array>>;
  readonly nameGrid: Uint8Array;
  readonly pauseText: Readonly<Record<PauseTable, Uint16Array>>;
  readonly dungeonMapLabels: Uint16Array;
  readonly creditsDigits: Uint16Array;
  readonly creditsScrollY?: Uint16Array;
  readonly endingCaptions: { readonly offsets: Uint16Array; readonly data: Uint8Array };
  readonly credits: { readonly text: Uint8Array; readonly offsets: Uint16Array; readonly map: Uint16Array };
  readonly sheets: readonly SheetOverride[];
  readonly sheetPatches: readonly SheetPatch[];
  readonly tilemapFont: number;
  readonly tilemapFontData?: Uint8Array;
  readonly pauseHeaders?: Uint16Array;
  readonly floorLabels?: Uint8Array;
  readonly copyScreen?: Uint8Array;
  readonly hudLifeRow?: Uint16Array;
}

interface TableRegion {
  readonly address: number;
  readonly count: number;
}

type EndingCaptionSource =
  | { readonly kind: 'bytes'; readonly offsets: TableRegion; readonly data: TableRegion }
  | {
      readonly kind: 'words';
      readonly offsets: TableRegion;
      readonly data: TableRegion;
      readonly vramRebase: number;
    };

type CreditsSource =
  | { readonly kind: 'bytes'; readonly text: TableRegion; readonly offsets: TableRegion; readonly map: TableRegion }
  | { readonly kind: 'words'; readonly text: TableRegion; readonly offsets: TableRegion };

interface TilemapRebase {
  readonly from: number;
  readonly to: number;
}

interface PauseHeaderSource {
  readonly pendantsRow: number;
  readonly crystalsRow: number;
}

interface FloorLabelTiles {
  readonly basementPrefix: number;
  readonly upperSuffix: number;
  readonly ground: readonly [number, number];
}

interface CopyScreenSource {
  readonly sourceFairyX: number;
  readonly targetFairyX: number;
  readonly sourceBlankColumn: number;
  readonly targetBlankColumn: number;
  readonly targetDigits: number;
}

interface ScreenAddressTable {
  readonly id: 'us' | 'de' | 'fr' | 'fr-c' | 'en' | 'ja-v1.0' | 'ja-rev1';
  readonly menuTilemaps: readonly number[];
  readonly selectFile: Readonly<Record<SelectFileTable, TableRegion>>;
  readonly nameGrid: TableRegion;
  readonly pauseText: Readonly<Record<PauseTable, TableRegion>>;
  readonly dungeonMapLabels: TableRegion;
  readonly creditsDigits: TableRegion;
  readonly endingCaptions: EndingCaptionSource;
  readonly credits: CreditsSource;
  readonly sheetPointers: { readonly spr: number; readonly bg: number };
  readonly sheets: { readonly spr: readonly number[]; readonly bg: readonly number[] };
  readonly sheetPatches: readonly SheetPatchSource[];
  readonly tilemapRebase?: TilemapRebase;
  readonly pauseHeaders?: PauseHeaderSource;
  readonly floorLabels?: FloorLabelTiles;
  readonly copyScreen?: CopyScreenSource;
  readonly hudLifeRow?: TableRegion;
}

export type {
  CopyScreenSource, FloorLabelTiles, PauseHeaderSource, PauseTable, ScreenAddressTable,
  ScreenPayload, SelectFileTable, SheetKind, SheetOverride, SheetPatch, SheetPatchSource, TableRegion, TilemapRebase,
};
