/* @layer shared-game @kind logic */
/**
 * One place to turn a screen reference into words: a name when the dataset
 * has one, the game's own hex numbers when it does not, and a combined label
 * for reasons and evidence lines that read like a person wrote them.
 *
 * Accepts either a dataset `ScreenId` or a `GameScreenId` straight off the
 * live registers. The overworld half of a `GameScreenId` is ambiguous on its
 * own: the game exposes a screen's position within ONE world (0x00-0x3F), and
 * the dark-world copy of that position is the same number plus 0x40 in the
 * dataset's unified numbering. A caller holding a per-world number passes
 * `world` and this resolves the offset once, here, instead of every call site
 * doing its own arithmetic (and some of them forgetting to).
 */
import { findOne } from '../../data';
import type { ScreenId, ScreenRecord } from '../../data';
import { gameScreenIdOf, screenForGameId } from './game-id';
import type { GameScreenId } from './game-id';

/** The offset between a dark-world overworld position and its light-world twin,
 *  in the dataset's unified `overworldIndex` numbering. */
const DARK_WORLD_OVERWORLD_OFFSET = 0x40;

type ScreenRef =
  | { kind: 'id'; id: string }
  /** `gameId.screen` (for an `overworld` id) is a PER-WORLD number unless
   *  `world` is omitted, in which case it is treated as already unified. */
  | { kind: 'game'; gameId: GameScreenId; world?: 'light' | 'dark' };

interface ScreenDescription {
  /** `vanillaName ?? randomizerName`, or null when no record resolves. */
  name: string | null;
  id: ScreenId | null;
  /** 'room 0x104' / 'screen 0x2c' — always present, even with no record. */
  hexLabel: string;
  /** '<name> (<id>)' when a record resolves, `hexLabel` otherwise. */
  label: string;
}

const unifiedGameId = (gameId: GameScreenId, world: 'light' | 'dark' | undefined): GameScreenId => {
  if (gameId.kind !== 'overworld' || world !== 'dark') return gameId;
  return { kind: 'overworld', screen: gameId.screen + DARK_WORLD_OVERWORLD_OFFSET };
};

const formatGameId = (gameId: GameScreenId): string => (
  gameId.kind === 'overworld'
    ? `screen 0x${gameId.screen.toString(16).padStart(2, '0')}`
    : `room 0x${gameId.room.toString(16).padStart(2, '0')}`
);

const hexLabelFor = (ref: ScreenRef, record: ScreenRecord | undefined): string => {
  if (ref.kind === 'game') return formatGameId(unifiedGameId(ref.gameId, ref.world));
  if (record) {
    const gameId = gameScreenIdOf(record);
    if (gameId) return formatGameId(gameId);
  }
  return ref.id;
};

const recordFor = (ref: ScreenRef): ScreenRecord | undefined => (
  ref.kind === 'id'
    ? findOne('screen', (s) => s.id === ref.id)
    : screenForGameId(unifiedGameId(ref.gameId, ref.world))
);

/** A screen reference, described: a name when the dataset has one, the game's
 *  own numbers when it does not. */
const describeScreen = (ref: ScreenRef): ScreenDescription => {
  const record = recordFor(ref);
  const hexLabel = hexLabelFor(ref, record);
  const id = ref.kind === 'id' ? (ref.id as ScreenId) : (record?.id ?? null);
  const name = record ? (record.vanillaName ?? record.randomizerName) : null;
  return { name, id, hexLabel, label: name ? `${name} (${id})` : hexLabel };
};

export { describeScreen };
export type { ScreenDescription, ScreenRef };
