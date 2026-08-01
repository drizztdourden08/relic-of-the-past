/* @layer bridge-wasm @kind logic */
/**
 * TraversalId → the DISPLAY NAME of the place it leads to, or null when the
 * dataset cannot answer for it.
 *
 * A traversal id is the game's own number (`ow:19`, `room:112@0,0`), deliberately
 * not a dataset key, so a getter handed one returns a structurally-valid stand-in
 * instead of data. The previous code papered over that by testing whether the
 * resolved name still equalled the id — the same miss-detection that once broke
 * `screenLabel` — and printed the raw id whenever the lookup fell through. On the
 * overworld it fell through every time, because it searched for the index in
 * `roomIndex` while an overworld record carries it in `overworldIndex`: an exit
 * that used to name a place started reading `ow:1`.
 *
 * The number IS enough to find the record, as long as the lookup goes through the
 * field that holds it. One caveat: a bare room number is genuinely ambiguous —
 * the same number exists inside a palace and in a cave — so the asking screen
 * lends its palace, and when that still leaves more than one candidate this
 * answers null. A visible id beats a confidently wrong name.
 *
 * Names are for display only. Identity stays the traversal id; nothing here may
 * feed a traversal decision.
 */
import { find, findOne, getScreenByGameId } from '@shared/game/data';
import type { ScreenRecord } from '@shared/game/data';
import type { TraversalId } from '@shared/game/simulation';

/** `room:112`, with the region/entrance qualifiers a node key may carry. */
const SYNTHETIC_ROOM = /^room:(\d+)(?:[@^].*)?$/;
const SYNTHETIC_OW = /^ow:(\d+)$/;

const nameOf = (screen: ScreenRecord): string => screen.vanillaName ?? screen.randomizerName;

/**
 * The interior a room NUMBER names, or undefined when more than one place answers
 * to it.
 *
 * `palace` comes from the screen doing the asking, which is what makes the common
 * case decidable: a stair or a door inside a dungeon stays in that dungeon, so the
 * live palace picks the right one of two rooms sharing a number. Note the
 * room-keyed index is keyed on `roomIndex:palaceIndex`, so a palace-less lookup
 * only ever matches a palace-less record — the candidate scan is what covers a
 * dungeon room reached from outside any dungeon.
 */
const interiorFor = (roomIndex: number, palace?: number): ScreenRecord | undefined => {
  if (palace !== undefined) {
    const exact = getScreenByGameId({ roomIndex, palaceIndex: palace });
    if (exact) return exact;
  }
  const candidates = find('screen', (s) => s.kind !== 'overworld' && s.gameId.roomIndex === roomIndex);
  return candidates.length === 1 ? candidates[0] : undefined;
};

/** The dataset record a traversal id — or a real screen id — names. */
const recordFor = (id: TraversalId, palace?: number): ScreenRecord | undefined => {
  const known = findOne('screen', (s) => s.id === id);
  if (known) return known;
  const overworld = SYNTHETIC_OW.exec(id);
  if (overworld) return getScreenByGameId({ overworldIndex: Number(overworld[1]) });
  const room = SYNTHETIC_ROOM.exec(id);
  return room ? interiorFor(Number(room[1]), palace) : undefined;
};

/**
 * Name of the place `id` is, as seen FROM `from` — whose palace disambiguates a
 * shared room number. Null means "no name I can stand behind", and the caller
 * should show the id.
 */
const screenNameFor = (id: TraversalId, from?: TraversalId): string | null => {
  const palace = from !== undefined ? recordFor(from)?.gameId.palaceIndex : undefined;
  const record = recordFor(id, palace);
  return record ? nameOf(record) : null;
};

/** For a field that must hold a string: the raw id stands in for an unnamed place. */
const displayNameFor = (id: TraversalId): string => screenNameFor(id) ?? id;

export { displayNameFor, screenNameFor };
