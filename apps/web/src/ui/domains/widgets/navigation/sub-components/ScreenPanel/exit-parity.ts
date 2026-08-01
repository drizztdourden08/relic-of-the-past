/* @layer renderer-widgets @kind logic */
/**
 * Compares the exits the SIMULATOR would actually take against the edges the
 * flood found on the screen border.
 *
 * The two lists answer different questions and are allowed to differ — a door,
 * stair or warp is an exit with no border edge, and an edge the player cannot walk to
 * has no exit. Naming those two cases is the point: an edge with no exit is the
 * signature of a screen the run will never leave that way, which used to be
 * invisible in the widget.
 *
 * Comparison is on the screen NUMBER, not on an id string. A record id is a frozen
 * sequential id with no native value in it, so it cannot be derived from a room
 * number — matching ids directly meant every indoor edge looked like a mismatch.
 */
import type { ScreenAnnotation } from '@shared/game/simulation';
import { getScreen } from '@shared/game/data';
import type { ScreenId } from '@shared/game/data';
import { gameIdLabel, gameScreenIdOf } from '@shared/game/logic/queries/game-id';

interface EdgeLike {
  targetScreen: number;
  edge: string;
}

interface ExitParity {
  /** Border edges the flood reached but no exit was derived for. */
  edgesWithoutExit: string[];
  /** Exits that are not a border edge — doors, stairs, warps, fall holes. */
  exitsWithoutEdge: string[];
}

/**
 * A screen number as a reader-friendly label — the screen's real name when known.
 *
 * The palace index is REQUIRED to name an indoor room: room numbers collide across
 * palaces and caves (room 0x80 is both the castle's Jail Cell and a graveyard
 * cave), so without it the label can name the wrong place entirely.
 */
const screenLabel = (screen: number, isIndoors: boolean, palace?: number): string =>
  gameIdLabel(isIndoors ? { kind: 'room', room: screen, palace } : { kind: 'overworld', screen });

/** The screen number an exit's target id refers to (native room index or OW index). */
const targetNumber = (target: string): number | undefined => {
  const gameId = gameScreenIdOf(getScreen(target as ScreenId));
  if (!gameId) return undefined;
  return gameId.kind === 'overworld' ? gameId.screen : gameId.room;
};

const compareExitsToEdges = (
  exits: readonly ScreenAnnotation[],
  edges: readonly EdgeLike[],
  isIndoors: boolean,
  palaceIndex?: number,
): ExitParity => {
  const exitNumbers = new Set(
    exits.map((e) => (e.target ? targetNumber(e.target) : undefined))
      .filter((n): n is number => n !== undefined),
  );
  const edgeNumbers = new Set(edges.map((e) => e.targetScreen));

  return {
    edgesWithoutExit: [...edgeNumbers].filter((n) => !exitNumbers.has(n))
      .map((n) => screenLabel(n, isIndoors, palaceIndex)),
    exitsWithoutEdge: [...exitNumbers].filter((n) => !edgeNumbers.has(n))
      .map((n) => screenLabel(n, isIndoors, palaceIndex)),
  };
};

export { compareExitsToEdges, screenLabel };
export type { ExitParity };
