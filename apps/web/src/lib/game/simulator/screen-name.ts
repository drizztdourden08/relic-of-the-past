/* @layer bridge-wasm @kind logic */
/**
 * TraversalId -> the DISPLAY NAME of the place it leads to, or null when the dataset cannot
 * answer. A traversal id is the game's own number (`ow:19`, `room:112@0,0`), not a dataset key,
 * so the lookup must go through the field that holds it (`overworldIndex` for overworld
 * records, not `roomIndex`). A bare room number is ambiguous (palace vs cave), so the asking
 * screen lends its palace; if that still leaves more than one candidate, answer null. A visible
 * id beats a confidently wrong name. Names are display only; nothing here feeds traversal.
 */
import { find, findOne, getScreenByGameId } from '@shared/game/data';
import type { ScreenRecord } from '@shared/game/data';
import type { TraversalId } from '@shared/game/simulation';

/** `room:112`, with the region/entrance qualifiers a node key may carry. */
const SYNTHETIC_ROOM = /^room:(\d+)(?:[@^].*)?$/;
const SYNTHETIC_OW = /^ow:(\d+)$/;

const nameOf = (screen: ScreenRecord): string => screen.vanillaName ?? screen.randomizerName;

/**
 * The interior a room NUMBER names, or undefined when more than one place answers. `palace`
 * comes from the asking screen (a stair inside a dungeon stays in it). The room-keyed index is
 * keyed on `roomIndex:palaceIndex`, so a palace-less lookup only matches a palace-less record;
 * the candidate scan covers a dungeon room reached from outside any dungeon.
 */
const interiorFor = (roomIndex: number, palace?: number): ScreenRecord | undefined => {
  if (palace !== undefined) {
    const exact = getScreenByGameId({ roomIndex, palaceIndex: palace });
    if (exact) return exact;
  }
  const candidates = find('screen', (s) => s.kind !== 'overworld' && s.gameId.roomIndex === roomIndex);
  return candidates.length === 1 ? candidates[0] : undefined;
};

/** The dataset record a traversal id (or a real screen id) names. */
const recordFor = (id: TraversalId, palace?: number): ScreenRecord | undefined => {
  const known = findOne('screen', (s) => s.id === id);
  if (known) return known;
  const overworld = SYNTHETIC_OW.exec(id);
  if (overworld) return getScreenByGameId({ overworldIndex: Number(overworld[1]) });
  const room = SYNTHETIC_ROOM.exec(id);
  return room ? interiorFor(Number(room[1]), palace) : undefined;
};

/** Name of the place `id` is, as seen FROM `from` (whose palace disambiguates a shared room number). Null means show the id. */
const screenNameFor = (id: TraversalId, from?: TraversalId): string | null => {
  const palace = from !== undefined ? recordFor(from)?.gameId.palaceIndex : undefined;
  const record = recordFor(id, palace);
  return record ? nameOf(record) : null;
};

/** For a field that must hold a string: the raw id stands in for an unnamed place. */
const displayNameFor = (id: TraversalId): string => screenNameFor(id) ?? id;

export { displayNameFor, screenNameFor };
