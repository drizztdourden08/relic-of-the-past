/* @layer bridge-wasm @kind logic */
/**
 * Offline read of the name a player typed for one battery-save file. Ports
 * the game's own decode (Text_WritePlayerName and
 * Text_FilterPlayerNameCharacters, core/zelda3/src/messaging.c): six 16-bit
 * name-screen tile words at block offset 0x3D9, each folded to a dialogue
 * font code, then looked up in the US text alphabet.
 */
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import { slotBlockOffset } from './sram-slots';

const NAME_OFFSET = 0x3d9;
const NAME_LENGTH = 6;

/** Name-screen tile → dialogue font code, as the game filters it. */
const filterNameCode = (tile: number): number => {
  if (tile >= 0x76) return tile - 0x42; // digits
  if (tile === 0x5f) return 0x08;
  if (tile === 0x60) return 0x22;
  if (tile === 0x61) return 0x3e;
  return tile;
};

/** A bracketed alphabet entry is an icon glyph; it has no plain-text form. */
const glyphText = (code: number): string => {
  const glyph = kLanguages.us.alphabet[code] ?? ' ';
  return glyph.startsWith('[') ? '?' : glyph;
};

/** The file's player name, or null when the slot is empty or the name is blank. */
const offlinePlayerName = (sram: Uint8Array, slot: number): string | null => {
  const base = slotBlockOffset(sram, slot);
  if (base === null) return null;
  let name = '';
  for (let i = 0; i < NAME_LENGTH; i++) {
    const at = base + NAME_OFFSET + i * 2;
    const word = sram[at] | (sram[at + 1] << 8);
    name += glyphText(filterNameCode((word & 0xf) | ((word >> 1) & 0xf0)));
  }
  const trimmed = name.trimEnd();
  return trimmed.length > 0 ? trimmed : null;
};

export { offlinePlayerName };
