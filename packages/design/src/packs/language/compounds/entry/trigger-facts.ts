/* @layer renderer-components @kind logic */
import { find, getItemByGameId } from '@rotp/game-data';
import { gameIdLabel } from '@rotp/game-data';
import type { TriggerSourceRow } from '@rotp/game-data';
import { NO_FACTS } from './entry.constants';
import type { TriggerFacts } from './entry.type';

const hex = (value: number): string => `0x${value.toString(16).toUpperCase().padStart(2, '0')}`;

const nameOf = (record: { name?: string }): string => record.name ?? '';

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

const recordlessFacts = (row: TriggerSourceRow): TriggerFacts => {
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
  if (row.by !== 'room') return recordlessFacts(row);
  return {
    ...NO_FACTS,
    by: 'room',
    who: 'remote speech, heard on a floor marker',
    where: gameIdLabel({ kind: 'room', room: row.roomId }),
    nativeKey: `room ${hex(row.roomId)}`,
    citation: row.source,
  };
};

const triggerFactsOf = (row: TriggerSourceRow | null): TriggerFacts => {
  if (row === null) return NO_FACTS;
  if (row.by === 'actor') return actorFacts(row);
  if (row.by === 'item') return itemFacts(row);
  return placeFacts(row);
};

export { triggerFactsOf };
