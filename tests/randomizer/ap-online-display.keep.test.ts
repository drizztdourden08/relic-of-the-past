/* @layer tests @kind test */
/**
 * What the app shows of an online run: another player's item reads as one by name (with its
 * owner's name when the scouts gave one) wherever an item key is named or a check row is
 * built, and a stopped online session leaves no placement behind, so it never reads as a
 * local seed afterwards. In the game itself, the pickup says "<item> sent to <player>!" inside
 * the box, and is held up with the pool icon of the owner's game (the Archipelago mark for any
 * game without one), from 4bpp tiles that decode back to the quantized picture.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FOREIGN_ITEM_KEY, FOREIGN_ITEM_NAME } from '@shared/randomizer/archipelago/foreign-item';
import { ITEM } from '@shared/randomizer/world/item-ids.data';
import { itemKeyName } from '@shared/randomizer/world/display-names/item-key-name';
import { buildPlacementView } from '@app/lib/game/randomizer-client/placement-view';
import { currentRun } from '@app/lib/game/randomizer-client/run-kind';
import { virtualCheckIdOf } from '@app/lib/game/randomizer-client/virtual-locations';
import {
  getSessionState, resetSession, startOnline, stopActive,
} from '@app/lib/game/randomizer-client/session-store';
import { foreignItemLine } from '@app/lib/game/randomizer-client/foreign-item-line';
import { foreignIconIdOfGame } from '@app/lib/game/randomizer-client/foreign-icon-of-game';
import { FOREIGN_ICON_FIRST_ID, FOREIGN_ICON_LAST_ID } from '@app/lib/game/foreign-item-sentinel';
import { fitReceiptLine } from '@app/lib/game/session-dialogue/wrap-message';
import { toDialogueText } from '@app/lib/game/session-dialogue/dialogue-text';
import { dialogueCharsetOf, extraGlyphSlots, readableText } from '@shared/game/dialog/dialogue-charset';
import { stripHighlight } from '@shared/randomizer/receipt-text/highlight-markup';
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import {
  buildForeignIconsFile, FOREIGN_ICON_FILES, FOREIGN_ICON_PALETTE_BYTES,
} from '@shared/asset-extraction/item-sprites/foreign-icons';
import { chromaOf, toOklab } from '@shared/asset-extraction/graphics/oklab';
import { snesToRgba } from '@shared/asset-extraction/graphics/palette';
import { NEUTRAL_CHROMA } from '@shared/asset-extraction/item-sprites/perceptual-match';
import { extractArtBadge } from '@shared/asset-extraction/item-sprites/art-badge';
import { artImage } from '@shared/asset-extraction/item-sprites/art-picture';
import { quantizeIconPerceptual } from '@shared/asset-extraction/item-sprites/perceptual-quantize';
import { POOL_SPRITE_DEFINITIONS } from '@shared/game/data/sprite-manifest/pool-sprites';
import type { ImageBuffer } from '@shared/asset-extraction/graphics/png-writer';
import type { RGBA } from '@shared/asset-extraction/graphics/palette';
import type { ForeignOwners } from '@app/lib/game/randomizer-client/foreign-item-line';
import type { OnlineSession } from '@app/lib/game/randomizer-client/online-session';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';

type Status = OnlineSession['status'];

interface IconFile { pictures: Uint8Array[]; words: number[] }

/** The icon file read back: each picture's 256 palette indices, then the 16 palette words after them. */
const decodeIconFile = (file: Uint8Array, count: number): IconFile => {
  const pictures = Array.from({ length: count }, (_, n) => Uint8Array.from({ length: 256 }, (_, i) => {
    const x = i & 15;
    const y = i >> 4;
    const tile = n * 128 + ((y >> 3) * 2 + (x >> 3)) * 32;
    const bit = 7 - (x & 7);
    const [p0, p1, p2, p3] = [0, 1, 16, 17].map((plane) => (file[tile + (y & 7) * 2 + plane] >> bit) & 1);
    return p0 | (p1 << 1) | (p2 << 2) | (p3 << 3);
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

interface FakeOnline {
  session: OnlineSession;
  setStatus(status: Status): void;
  arm(placement: Placement, owners: ForeignOwners): void;
}

const online = vi.hoisted(() => ({ next: null as FakeOnline | null }));

vi.mock('@app/lib/log-bus', () => {
  const quiet = (): void => undefined;
  return { log: { core: quiet, app: quiet, randomizer: quiet, wasm: quiet, ipc: quiet, sim: quiet, error: quiet } };
});
vi.mock('@app/lib/game/randomizer-client/online-session', () => ({ createOnlineSession: () => online.next?.session }));
vi.mock('@app/lib/game/randomizer-client/local-session', () => ({ createLocalSession: () => null }));

const createFakeOnline = (): FakeOnline => {
  let status: Status = 'idle';
  const statusListeners = new Set<(next: Status) => void>();
  const placementListeners = new Set<(placement: Placement, owners: ForeignOwners) => void>();
  const setStatus = (next: Status): void => {
    status = next;
    for (const listener of statusListeners) listener(next);
  };
  const session = {
    kind: 'online',
    get status() { return status; },
    start: async () => setStatus('active'),
    stop: () => setStatus('idle'),
    onStatusChange: (listener: (next: Status) => void) => {
      statusListeners.add(listener);
      return () => statusListeners.delete(listener);
    },
    onPlacement: (listener: (placement: Placement, owners: ForeignOwners) => void) => {
      placementListeners.add(listener);
      return () => placementListeners.delete(listener);
    },
    networkStatus: null,
    onNetworkStatus: () => () => undefined,
  } as unknown as OnlineSession;
  return {
    session,
    setStatus,
    arm: (placement, owners) => { for (const listener of placementListeners) listener(placement, owners); },
  };
};

const placementOf = (locations: Record<string, string>): Placement => ({
  seed: 'test', medallions: { mire: ITEM.ether, turtleRock: ITEM.quake }, locations, shopPrices: {}, pondDemands: {},
  spheres: [{ index: 1, locations: Object.keys(locations) }], stats: {},
}) as unknown as Placement;

const SCOUTED = placementOf({ 'check-001': FOREIGN_ITEM_KEY, 'check-002': FOREIGN_ITEM_KEY, 'check-003': ITEM.bow });
const OWNERS: ForeignOwners = { 'check-001': 'Zelda' };

const startArmed = async (): Promise<FakeOnline> => {
  const fake = createFakeOnline();
  online.next = fake;
  await startOnline({ url: 'ws://host:1', slotName: 'Link' }, 'manual');
  fake.arm(SCOUTED, OWNERS);
  return fake;
};

beforeEach(() => {
  resetSession();
});

describe('another player\'s item on display', () => {
  it('itemKeyName names it and never throws', () => {
    expect(itemKeyName(FOREIGN_ITEM_KEY)).toBe(FOREIGN_ITEM_NAME);
    expect(FOREIGN_ITEM_NAME).toBe('Another player\'s item');
  });

  it('the placement view shows it with the owner the scouts named, and never as a record', () => {
    const view = buildPlacementView(SCOUTED, OWNERS);
    expect(view.foreignByCheck.get('check-001')).toBe('Zelda\'s item');
    expect(view.foreignByCheck.get('check-002')).toBe(FOREIGN_ITEM_NAME);
    expect(view.itemByCheck.has('check-001')).toBe(false);
    expect(view.itemByCheck.get('check-003')).toBe(ITEM.bow);
    expect(view.unmatchedItems).toEqual([]);
  });

  it('a pond prize and a wish pond rung name the other player\'s item on their own rows', () => {
    const prize: LocationKey = 'slot-pond-capacity-1';
    const rung: LocationKey = 'slot-pond-wishing-3';
    const view = buildPlacementView(placementOf({ [prize]: FOREIGN_ITEM_KEY, [rung]: FOREIGN_ITEM_KEY }), { [prize]: 'Zelda' });
    expect(view.foreignByCheck.get(virtualCheckIdOf(prize))).toBe('Zelda\'s item');
    expect(view.foreignByCheck.get(virtualCheckIdOf(rung))).toBe(FOREIGN_ITEM_NAME);
    expect(view.unmatchedItems).toEqual([]);
  });

  it('the session store carries the owners with the scouted placement', async () => {
    await startArmed();
    expect(currentRun().kind).toBe('online');
    expect(getSessionState().placement).toBe(SCOUTED);
    expect(getSessionState().foreignOwners).toEqual(OWNERS);
  });
});

describe('a stopped online session', () => {
  it('drops its placement on stop, so the run reads as plain play and not a seed', async () => {
    await startArmed();
    stopActive();
    expect(getSessionState().placement).toBeNull();
    expect(getSessionState().foreignOwners).toEqual({});
    expect(currentRun().kind).toBe('normal');
  });

  it('drops it when the session winds down on its own', async () => {
    const fake = await startArmed();
    fake.setStatus('idle');
    expect(getSessionState().session).toBeNull();
    expect(getSessionState().placement).toBeNull();
    expect(currentRun().kind).toBe('normal');
  });

  it('an online session ended by an error is no run, whatever it left', async () => {
    const fake = await startArmed();
    fake.setStatus('error');
    expect(getSessionState().session).not.toBeNull();
    expect(getSessionState().placement).toBeNull();
    expect(currentRun().kind).toBe('normal');
  });
});

describe('another player\'s item in the game itself', () => {
  const US = kLanguages.us;
  /** Every glyph 8 px wide: 20 per row, three rows. */
  const WIDTHS = new Uint8Array(US.alphabet.length).fill(8);
  const CHARSET = dialogueCharsetOf(US.alphabet, WIDTHS, extraGlyphSlots(US.alphabet, WIDTHS.length));
  /** The line the box keeps, read as plain text (the highlight markup has no width). */
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
    const iconOf = (game: string): string => FOREIGN_ICON_FILES[foreignIconIdOfGame(game) - FOREIGN_ICON_FIRST_ID];
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

  describe('the pool icons in the game', () => {
    const pictures = poolPictures();
    const file = buildForeignIconsFile(pictures)!;
    const decoded = decodeIconFile(file, FOREIGN_ICON_FILES.length);
    const palette = decoded.words.map((word, i): RGBA => (i === 0 ? [0, 0, 0, 0] : snesToRgba(word)));
    /** Each source colour of |name| (hex) to the colour the game draws it in. */
    const drawnColors = (name: string): Map<string, RGBA> => {
      const picture = pictures.get(name)!;
      const indices = decoded.pictures[FOREIGN_ICON_FILES.indexOf(name)];
      const map = new Map<string, RGBA>();
      indices.forEach((index, i) => {
        const source = picture.getPixel(i & 15, i >> 4);
        if (source[3] !== 0) map.set(hexOf(source), palette[index]);
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
        const indices = quantizeIconPerceptual(pictures.get(name)!, palette).indices;
        expect(decoded.pictures[n], name).toEqual(indices);
        expect(indices.filter((index) => index !== 0).length, name).toBeGreaterThan(64);
      });
    });

    it('keeps the fused shadow in three distinct greys', () => {
      const greys = new Set([...drawnColors('pool-twilight-princess').values()].filter(isGrey).map(hexOf));
      expect(greys.size).toBeGreaterThanOrEqual(3);
    });

    it('keeps the egg pink', () => {
      const [r, g, b] = drawnColors('pool-links-awakening').get('ff6ee7')!;
      expect(r - g).toBeGreaterThan(80);
      expect(b - g).toBeGreaterThan(60);
    });

    it('draws every pixel from its own palette, greys as greys and hues as hues', () => {
      for (const [n, name] of FOREIGN_ICON_FILES.entries()) {
        const picture = pictures.get(name)!;
        decoded.pictures[n].forEach((index, i) => {
          const source = picture.getPixel(i & 15, i >> 4);
          expect(index === 0, `${name} pixel ${i}`).toBe(source[3] === 0);
          if (index === 0) return;
          expect(palette[index][3], `${name} pixel ${i}`).toBe(255);
          expect(isGrey(palette[index]), `${name} #${hexOf(source)}`).toBe(isGrey(source));
        });
      }
      // Two shades of one hue stay apart: the gold shield and its pale cross.
      const shield = drawnColors('pool-zelda-2');
      expect(hexOf(shield.get('fcbb28')!)).not.toBe(hexOf(shield.get('f5de82')!));
    });
  });
});
