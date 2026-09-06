/* @layer renderer-lib @kind types */
/**
 * The Relic Sprite Pack is our own container for a player sheet.
 *
 * A zip holding a manifest and the raw tiles. It exists for the one thing ZSPR structurally
 * cannot do: keep the original palette and the edits as separate layers, so reverting still
 * works after a file has been closed and reopened, and an export can choose which layer to
 * bake. It also has room for palettes the core does not consume yet, carried instead of
 * lost so a future change can pick them up.
 */
import type { OutfitPalette, SheetPalette, PaletteOverride, SheetMeta } from '@shared/game/data/player-sheet/types';

const RSP_VERSION = 1;
const MANIFEST_ENTRY = 'manifest.json';
const SHEET_ENTRY = 'sheet.bin';
const PREVIEW_ENTRY = 'sheet.png';

/** Where the sheet came from, kept so a pack can say what it was derived from. */
interface RspSource {
  kind: 'zspr' | 'stock' | 'rsp';
  name: string;
}

/**
 * Palettes the format carries but the core cannot use today: outfit index 4 is the flash
 * palette (PlayerSprite_Apply stops at four outfits) and the weapon palettes are loaded
 * from their own assets, untouched by any sheet. Present so the data survives a round trip.
 */
interface RspExtras {
  electro?: OutfitPalette;
  sword?: readonly number[];
  shield?: readonly number[];
}

interface RspManifest {
  format: 'rsp';
  version: number;
  meta: SheetMeta;
  palettes: {
    original: SheetPalette;
    override: PaletteOverride;
  };
  extras?: RspExtras;
  source?: RspSource;
}

export { RSP_VERSION, MANIFEST_ENTRY, SHEET_ENTRY, PREVIEW_ENTRY };
export type { RspSource, RspExtras, RspManifest };
