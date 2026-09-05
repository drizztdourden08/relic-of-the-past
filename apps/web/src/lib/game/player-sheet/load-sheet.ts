/* @layer renderer-lib @kind logic */
/**
 * Read a stored sprite into a PlayerSheet, whichever container it is in, and write one back.
 *
 * One place decides container by extension so nothing else has to. The ZSPR path takes an
 * optional stock palette to stand in for a sheet that ships tiles only; the pack path
 * carries its own palettes and needs no help.
 */
import type { PlayerSheet, SheetPalette } from '@shared/game/data/player-sheet/types';
import { readLinkSprite, writeLinkSprite } from '@app/lib/storage/link-sprites-store';
import { parseZspr } from '../zspr';
import { toZsprBytes } from '../zspr-write';
import { parseRsp, toRspBytes, isRspName } from '../rsp';

const loadSheet = async (name: string, stockPalette?: SheetPalette): Promise<PlayerSheet | null> => {
  const bytes = await readLinkSprite(name);
  if (!bytes) return null;
  return isRspName(name) ? parseRsp(bytes) : parseZspr(bytes, stockPalette);
};

/** Serializes to whatever container `name` implies. */
const sheetToBytes = async (name: string, sheet: PlayerSheet): Promise<Uint8Array> =>
  isRspName(name) ? toRspBytes(sheet) : toZsprBytes(sheet);

const saveSheet = async (name: string, sheet: PlayerSheet): Promise<void> => {
  await writeLinkSprite(name, await sheetToBytes(name, sheet));
};

/**
 * A stored sprite as bytes the core will accept, whatever container it lives in.
 *
 * The core only ever reads ZSPR, because the INI points at one path and PlayerSprite_Apply checks
 * for the magic, so a pack has to be flattened before it can be staged for boot or pushed
 * at a running game. A ZSPR is passed through untouched, not re-serialized: there is
 * nothing to gain from rewriting bytes that are already in the right shape.
 */
const readSpriteAsZspr = async (name: string): Promise<Uint8Array | null> => {
  if (!isRspName(name)) return readLinkSprite(name);
  const sheet = await loadSheet(name);
  return sheet ? toZsprBytes(sheet) : null;
};

export { loadSheet, saveSheet, sheetToBytes, readSpriteAsZspr };
