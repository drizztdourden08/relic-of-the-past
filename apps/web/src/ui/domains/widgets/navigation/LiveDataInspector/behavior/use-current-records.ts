/* @layer renderer-widgets @kind hook */
/**
 * EVERY record in the selected collection that relates to the current screen
 * — not just one. A screen commonly owns several `connection` records (each
 * door/exit its own edge) and several `check` records (each NPC or chest its
 * own entry); `actor`/`item` can repeat too, whenever more than one sprite
 * type or granted item showed up on the same visit. Only the kinds a screen
 * has a direct, unambiguous live link to resolve are handled here — a
 * collection with no such link (area, tag, …) shows nothing rather than
 * guessing.
 *
 * `connection` reuses `observations.existingConnections` as-is: it is already
 * every point touching this screen (see `useConnectionStatus`'s
 * `c.screenId === screenId || c.toConnectionId`-resolved screen match), the
 * same list the widget's own recommendation filtering already trusts — there
 * was never a "one connection" to pick here, only a `[0]` that discarded the rest.
 */
import { useMemo } from 'react';
import {
  find, getActorByGameId, getDungeonByGameId, getItemByGameId, getScreen,
} from '@shared/game/data';
import type { EntityKind, EntityRecordMap } from '@shared/game/data';
import type { DetectionContext } from '@shared/game/recommendations';

type AnyRecord = EntityRecordMap[EntityKind];

const NO_RECORDS: readonly AnyRecord[] = [];

/** Distinct sprite spawns (or grants) of the same type resolve to the same record — one card each, not one per spawn. */
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
