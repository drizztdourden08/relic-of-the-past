/* @layer tests @kind test */
import { describe, expect, it, vi } from 'vitest';
import { foreignItemLine, foreignIconIdOfGame, FOREIGN_ICON_FIRST_ID, FOREIGN_ICON_LAST_ID } from '@rotp/randomizer';
import { fitReceiptLine, toDialogueText, stripHighlight } from '@rotp/game-core';
import { dialogueCharsetOf, extraGlyphSlots, readableText, POOL_SPRITE_DEFINITIONS } from '@rotp/game-data';
import { kLanguages, buildForeignIconsFile, FOREIGN_ICON_FILES, FOREIGN_ICON_PALETTE_BYTES, chromaOf, toOklab, snesToRgba, NEUTRAL_CHROMA, extractArtBadge, artImage, quantizeIconPerceptual } from '@rotp/asset-extraction';
import type { ImageBuffer, RGBA } from '@rotp/asset-extraction';
import { required } from '../../required';

vi.mock('@app/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});

interface IconFile { pictures: Uint8Array[]; words: number[] }

const decodeIconFile = (file: Uint8Array, count: number): IconFile => {
  const pictures = Array.from({ length: count }, (_, n) => Uint8Array.from({ length: 256 }, (_, i) => {
    const x = i & 15;
    const y = i >> 4;
    const tile = n * 128 + ((y >> 3) * 2 + (x >> 3)) * 32;
    const bit = 7 - (x & 7);
    const planeBit = (plane: number): number => ((file[tile + (y & 7) * 2 + plane] ?? 0) >> bit) & 1;
    return planeBit(0) | (planeBit(1) << 1) | (planeBit(16) << 2) | (planeBit(17) << 3);
  }));
  const view = new DataView(file.buffer, file.byteOffset);
  return { pictures, words: Array.from({ length: 16 }, (_, i) => view.getUint16(count * 128 + i * 2, true)) };
};

const isGrey = (color: RGBA): boolean => chromaOf(toOklab(color)) < NEUTRAL_CHROMA;
const hexOf = (color: RGBA): string => color.slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join('');

const poolPictures = (): Map<string, ImageBuffer> => new Map(POOL_SPRITE_DEFINITIONS.map((def) => {
  const { art, badge } = def.extract as { art: string; badge?: string };
  return [def.file, badge === undefined ? artImage(art) : extractArtBadge({ art, badge })];
}));

describe('another player\'s item in the game itself', () => {
  const US = required(kLanguages.us, 'US language');
  const WIDTHS = new Uint8Array(US.alphabet.length).fill(8);
  const CHARSET = dialogueCharsetOf(US.alphabet, WIDTHS, extraGlyphSlots(US.alphabet, WIDTHS.length));
  const shown = (line: ReturnType<typeof foreignItemLine>): string => readableText(stripHighlight(
    fitReceiptLine([line].flat().map((text) => toDialogueText(text as string, CHARSET)), CHARSET.alphabet, CHARSET.widths)), CHARSET);

  it('names the item and the player, underscore and all', () => {
    expect(shown(foreignItemLine({ owner: 'Drizztdourden_', item: 'Progressive Scale' })))
      .toBe('Progressive Scale sent to Drizztdourden_!');
    expect(foreignItemLine(undefined)).toBe('Sent to another player!');
  });

  it('shortens a long item name with an ellipsis before it ever drops the player', () => {
    const line = shown(foreignItemLine({ owner: 'Drizztdourden_', item: 'Small Key (Spirit Temple) for the Other Side of the Wall' }));
    expect(line).toMatch(/^Small Key \(Spirit Temple\)[A-Za-z ]*\.\.\. sent to Drizztdourden_!$/);
  });

  it('picks each game\'s own pool icon, and the Archipelago mark for any other game', () => {
    const iconOf = (game: string): string | undefined => FOREIGN_ICON_FILES[foreignIconIdOfGame(game) - FOREIGN_ICON_FIRST_ID];
    expect(iconOf('Ship of Harkinian')).toBe('pool-ocarina-of-time');
    expect(iconOf('Ocarina of Time')).toBe('pool-ocarina-of-time');
    expect(iconOf('Majora\'s Mask Recompiled')).toBe('pool-majoras-mask');
    expect(iconOf('Links Awakening DX')).toBe('pool-links-awakening');
    expect(iconOf('The Legend of Zelda')).toBe('pool-zelda-1');
    expect(iconOf('The Wind Waker')).toBe('pool-wind-waker');
    expect(iconOf('Twilight Princess')).toBe('pool-twilight-princess');
    expect(iconOf('The Legend of Zelda - Oracle of Seasons')).toBe('pool-oracle-of-seasons');
    expect(iconOf('Super Metroid')).toBe('pool-archipelago');
    expect(iconOf('A Link to the Past')).toBe('pool-archipelago');
    expect(foreignIconIdOfGame(undefined)).toBe(FOREIGN_ICON_FIRST_ID + FOREIGN_ICON_FILES.indexOf('pool-archipelago'));
    expect(FOREIGN_ICON_FIRST_ID + FOREIGN_ICON_FILES.length - 1).toBeLessThanOrEqual(FOREIGN_ICON_LAST_ID);
    expect([...FOREIGN_ICON_FILES].sort()).toEqual(POOL_SPRITE_DEFINITIONS.map((def) => def.file).sort());
  });
});

describe('another player\'s item in the game itself', () => {
  describe('the pool icons in the game', () => {
    const pictures = poolPictures();
    const file = required(buildForeignIconsFile(pictures) ?? undefined, 'foreign icons file');
    const decoded = decodeIconFile(file, FOREIGN_ICON_FILES.length);
    const palette = decoded.words.map((word, i): RGBA => (i === 0 ? [0, 0, 0, 0] : snesToRgba(word)));
    const pictureOf = (name: string): ImageBuffer => required(pictures.get(name), `${name} picture`);
    const paletteColor = (index: number): RGBA => required(palette[index], `palette colour ${index}`);
    const drawnColors = (name: string): Map<string, RGBA> => {
      const picture = pictureOf(name);
      const indices = required(decoded.pictures[FOREIGN_ICON_FILES.indexOf(name)], `${name} decoded picture`);
      const map = new Map<string, RGBA>();
      indices.forEach((index, i) => {
        const source = picture.getPixel(i & 15, i >> 4);
        if (source[3] !== 0) map.set(hexOf(source), paletteColor(index));
      });
      return map;
    };

    it('carries every picture as 4bpp tiles, then its own 15-colour palette, and decodes back', () => {
      expect(file.length).toBe(128 * FOREIGN_ICON_FILES.length + FOREIGN_ICON_PALETTE_BYTES);
      expect(decoded.words[0]).toBe(0);
      expect(new Set(decoded.words.slice(1)).size).toBe(15);
      expect(decoded.words).toContain(0x0000);
      expect(decoded.words).toContain(0x7fff);
      FOREIGN_ICON_FILES.forEach((name, n) => {
        const indices = quantizeIconPerceptual(pictureOf(name), palette).indices;
        expect(decoded.pictures[n], name).toEqual(indices);
        expect(indices.filter((index) => index !== 0).length, name).toBeGreaterThan(64);
      });
    });

    it('keeps the fused shadow in three distinct greys', () => {
      const greys = new Set([...drawnColors('pool-twilight-princess').values()].filter(isGrey).map(hexOf));
      expect(greys.size).toBeGreaterThanOrEqual(3);
    });

    it('keeps the egg pink', () => {
      const [r, g, b] = required(drawnColors('pool-links-awakening').get('ff6ee7'), 'egg pink');
      expect(r - g).toBeGreaterThan(80);
      expect(b - g).toBeGreaterThan(60);
    });

    it('draws every pixel from its own palette, greys as greys and hues as hues', () => {
      for (const [n, name] of FOREIGN_ICON_FILES.entries()) {
        const picture = pictureOf(name);
        required(decoded.pictures[n], `${name} decoded picture`).forEach((index, i) => {
          const source = picture.getPixel(i & 15, i >> 4);
          expect(index === 0, `${name} pixel ${i}`).toBe(source[3] === 0);
          if (index === 0) return;
          expect(paletteColor(index)[3], `${name} pixel ${i}`).toBe(255);
          expect(isGrey(paletteColor(index)), `${name} #${hexOf(source)}`).toBe(isGrey(source));
        });
      }
      const shield = drawnColors('pool-zelda-2');
      const goldShield = 'fcbb28';
      const paleCross = 'f5de82';
      expect(hexOf(required(shield.get(goldShield), 'gold shield colour')))
        .not.toBe(hexOf(required(shield.get(paleCross), 'pale cross colour')));
    });
  });
});
