/* @layer bridge-wasm @kind logic */
/**
 * Hands the extra glyphs (extra-glyphs.data.ts) to the core, which writes them into the active
 * font's spare slots (core/game-hooks/dialog_extra_glyphs.c). One table entry per glyph: its slot,
 * its width, then its two tiles. The core keeps the copy it built while the table stays the same,
 * so loading on every compose costs a compare. A core without the export draws no extra glyph, and
 * the composer then falls back for those characters.
 *
 * The slots the core took are kept here too, for the modern face of the enhanced box, which looks a
 * glyph code up as text (active-alphabet.ts).
 */
import { EXTRA_GLYPHS } from '@shared/game/dialog/extra-glyphs.data';
import { extraGlyphTiles } from '@shared/game/dialog/extra-glyph-tiles';
import { dialogueCharsetOf, extraGlyphSlots } from '@shared/game/dialog/dialogue-charset';
import type { DialogueCharset, ExtraGlyphSlot } from '@shared/game/dialog/dialogue-charset';
import type { EmscriptenModule } from '../types';

const ENTRY_BYTES = 34;
const TILE_OFFSET = 2;

let loaded: readonly ExtraGlyphSlot[] = [];

const coreTakesGlyphs = (mod: EmscriptenModule): boolean =>
  typeof (mod as unknown as Record<string, unknown>)._WasmLoadExtraGlyphs === 'function';

const tableOf = (extras: readonly ExtraGlyphSlot[]): Uint8Array => {
  const table = new Uint8Array(extras.length * ENTRY_BYTES);
  extras.forEach((extra, index) => {
    const glyph = EXTRA_GLYPHS.find((candidate) => candidate.char === extra.char);
    if (glyph === undefined) return;
    table[index * ENTRY_BYTES] = extra.slot;
    table[index * ENTRY_BYTES + 1] = extra.width;
    table.set(extraGlyphTiles(glyph), index * ENTRY_BYTES + TILE_OFFSET);
  });
  return table;
};

/** Write |extras| into the core's font; true when it took every one. */
const loadExtraGlyphs = (mod: EmscriptenModule, extras: readonly ExtraGlyphSlot[]): boolean => {
  if (extras.length === 0 || !coreTakesGlyphs(mod)) {
    loaded = [];
    return false;
  }
  const ptr = mod.ccall('WasmExtraGlyphTable', 'number', [], []);
  mod.HEAPU8.set(tableOf(extras), ptr);
  const taken = mod.ccall('WasmLoadExtraGlyphs', 'number', ['number', 'number'], [ptr, extras.length]);
  loaded = taken === extras.length ? extras : [];
  return loaded.length > 0;
};

/**
 * The charset a session line is composed in: |alphabet| and the font's |widths|, plus the extra
 * glyphs the core took into the spare slots (none from a core without them).
 */
const sessionCharset = (mod: EmscriptenModule, alphabet: readonly string[], widths: Uint8Array): DialogueCharset => {
  const slots = extraGlyphSlots(alphabet, widths.length);
  return dialogueCharsetOf(alphabet, widths, loadExtraGlyphs(mod, slots) ? slots : []);
};

/** Session stop: the font's own glyphs back. */
const clearExtraGlyphs = (mod: EmscriptenModule | null): void => {
  loaded = [];
  if (mod && coreTakesGlyphs(mod)) mod.ccall('WasmClearExtraGlyphs', null, [], []);
};

/** The extra glyphs the core holds right now. */
const loadedExtraGlyphs = (): readonly ExtraGlyphSlot[] => loaded;

export { clearExtraGlyphs, loadExtraGlyphs, loadedExtraGlyphs, sessionCharset };
