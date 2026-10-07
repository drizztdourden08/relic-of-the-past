/* @layer renderer-widgets @kind hook */
/**
 * EVERY record in the selected collection that relates to the current screen.
 * A screen commonly owns several `connection` and `check` records, and
 * `actor`/`item` can repeat too. Only kinds with a direct live link are
 * handled; a collection without one (area, tag) shows nothing instead of
 * guessing.
 *
 * `connection` reuses `observations.existingConnections` as-is: it is already
 * every point touching this screen, the same list the widget's recommendation
 * filtering trusts. The old `[0]` discarded the rest.
 */
import { useMemo } from 'react';
import {
  find, getActorByGameId, getDungeonByGameId, getItemByGameId, getScreen,
} from '@shared/game/data';
import type { EntityKind, EntityRecordMap } from '@shared/game/data';
import type { DetectionContext } from '@shared/game/recommendations';

type AnyRecord = EntityRecordMap[EntityKind];

const NO_RECORDS: readonly AnyRecord[] = [];

/** Distinct spawns (or grants) of the same type resolve to one record: one card each, not one per spawn. */
const dedupeById = <T extends { id: string }>(records: readonly (T | undefined)[]): readonly T[] => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const record of records) {
    if (!record || seen.has(record.id)) continue;
    seen.add(record.id);
    out.push(record);
  }
  return out;
};

const recordsFor = (kind: EntityKind, context: DetectionContext): readonly AnyRecord[] => {
  const { screenId, observations } = context;

  if (kind === 'screen') {
    const screen = screenId ? getScreen(screenId) : null;
    return screen ? [screen] : NO_RECORDS;
  }

  if (kind === 'dungeon') {
    const palaceIndex = observations.liveGameId?.palaceIndex;
    if (!observations.isIndoors || palaceIndex == null) return NO_RECORDS;
    const dungeon = getDungeonByGameId({ palaceIndex });
    return dungeon ? [dungeon] : NO_RECORDS;
  }

  if (kind === 'connection') return observations.existingConnections;

  if (kind === 'check') return screenId ? find('check', check => check.screenId === screenId) : NO_RECORDS;

  if (kind === 'actor') {
    return dedupeById((observations.liveSprites ?? [])
      .map(sprite => getActorByGameId({ spriteType: sprite.spriteType })));
  }

  if (kind === 'item') {
    return dedupeById((observations.grantedItems ?? [])
      .map(grant => getItemByGameId({ receiveItemId: grant.itemId })));
  }

  return NO_RECORDS;
};

const useCurrentRecords = (kind: EntityKind, context: DetectionContext): readonly AnyRecord[] =>
  useMemo(() => recordsFor(kind, context), [kind, context]);

export { recordsFor, useCurrentRecords };
