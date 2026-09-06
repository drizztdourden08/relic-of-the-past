/* @layer renderer-components @kind logic */
/**
 * "Who says this line" answered from the mined trigger source, joined to the
 * dataset and put into words.
 *
 * The source dataset is keyed the way the game core is keyed: a type byte, an
 * area, a room, a receipt index. None of those is readable, so each one is
 * looked up and the RECORD supplies the name. Nothing is named here. Where the
 * data has no name, the model reports the bare key instead of filling the gap.
 *
 * Three gaps are real and are reported as gaps:
 *
 * - Two entries carry no mined row at all, so there is no source to cite.
 * - Two type bytes have no record yet, so the byte is shown and no name is.
 * - A type byte can match SEVERAL records, because the game reuses one type for
 *   what the dataset treats as distinct actors. The row's own pick is named and
 *   the rest are offered as the other candidates, which is honest about the
 *   ambiguity instead of hiding it behind one arbitrary answer.
 */
import { find, getItemByGameId } from '@shared/game/data';
import { triggerSourceFor } from '@shared/game/data/dialogue-context';
import { gameIdLabel } from '@shared/game/logic/queries/game-id';
import type { TriggerSourceRow } from '@shared/game/data/dialogue-context';

/** What the metadata panel and the collapsed row both read. */
type TriggerFacts = {
  /** The key kind the game looks this entry up by; null when nothing is known. */
  by: TriggerSourceRow['by'] | null;
  /** Who or what opens it, named from the data. Empty when the data has no name. */
  who: string;
  /** Where it happens, for a place or room key. Empty otherwise. */
  where: string;
  /** The native key, spelled as the game spells it. Empty when there is none. */
  nativeKey: string;
  /** Other records the same key could mean, named from the data. */
  alsoNames: string[];
  /** The evidence, as `file:line`. Empty when the entry has no mined row. */
  citation: string;
};

const NO_FACTS: TriggerFacts = {
  by: null, who: '', where: '', nativeKey: '', alsoNames: [], citation: '',
};

const hex = (value: number): string => `0x${value.toString(16).toUpperCase().padStart(2, '0')}`;

/** A record's own name, preferring the in-game term the dataset recorded. */
const nameOf = (record: { vanillaName?: string; randomizerName?: string }): string =>
  record.vanillaName ?? record.randomizerName ?? '';

const actorFacts = (row: TriggerSourceRow & { by: 'actor' }): TriggerFacts => {
  const candidates = find('actor', (actor) => actor.gameId.spriteType === row.spriteType);
  const primary = candidates.find((actor) => actor.id === row.actorId) ?? candidates[0];

  return {
    by: 'actor',
    who: primary === undefined ? '' : nameOf(primary),
    where: '',
    nativeKey: `type ${hex(row.spriteType)}`,
    alsoNames: candidates
      .filter((actor) => actor.id !== primary?.id)
      .map(nameOf)
      .filter((name) => name.length > 0),
    citation: row.source,
  };
};

const itemFacts = (row: TriggerSourceRow & { by: 'item' }): TriggerFacts => {
  const record = getItemByGameId({ receiveItemId: row.itemId });
  return {
    ...NO_FACTS,
    by: 'item',
    who: record === undefined ? '' : nameOf(record),
    nativeKey: `pickup ${hex(row.itemId)}`,
    citation: row.source,
  };
};

/** The words for a source whose key names no record: a companion, or the core. */
const plainFacts = (row: TriggerSourceRow): TriggerFacts => {
  if (row.by === 'follower') {
    return {
      ...NO_FACTS,
      by: 'follower',
      who: 'the companion walking behind the player',
      nativeKey: `companion ${hex(row.followerId)}`,
      citation: row.source,
    };
  }
  if (row.by === 'engine') {
    return { ...NO_FACTS, by: 'engine', who: row.site, citation: row.source };
  }
  return {
    ...NO_FACTS,
    by: 'cursor-frame',
    who: 'the prompt renderer, redrawing its selection marker',
    citation: row.source,
  };
};

const placeFacts = (row: TriggerSourceRow): TriggerFacts => {
  if (row.by === 'place') {
    return {
      ...NO_FACTS,
      by: 'place',
      who: 'a readable marker',
      where: gameIdLabel({ kind: 'overworld', screen: row.areaId }),
      nativeKey: `area ${hex(row.areaId)}`,
      citation: row.source,
    };
  }
  if (row.by !== 'room') return plainFacts(row);
  return {
    ...NO_FACTS,
    by: 'room',
    who: 'remote speech, heard on a floor marker',
    where: gameIdLabel({ kind: 'room', room: row.roomId }),
    nativeKey: `room ${hex(row.roomId)}`,
    citation: row.source,
  };
};

/** The facts for one mined row, or the empty set when the entry has none. */
const triggerFactsOf = (row: TriggerSourceRow | null): TriggerFacts => {
  if (row === null) return NO_FACTS;
  if (row.by === 'actor') return actorFacts(row);
  if (row.by === 'item') return itemFacts(row);
  return placeFacts(row);
};

/**
 * The facts for one entry, resolved once and kept.
 *
 * Both the dataset and its joins are static for the life of the app, and the
 * list re-renders on every keystroke of the search box, so a per-render join
 * across every actor record for each of a few hundred rows would be paid over
 * and over for an answer that cannot change.
 */
const kCache = new Map<number, TriggerFacts>();

const factsForEntry = (id: number): TriggerFacts => {
  const hit = kCache.get(id);
  if (hit !== undefined) return hit;
  const facts = triggerFactsOf(triggerSourceFor(id));
  kCache.set(id, facts);
  return facts;
};

export { factsForEntry, NO_FACTS, triggerFactsOf };
export type { TriggerFacts };
