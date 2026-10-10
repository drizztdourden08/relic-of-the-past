/* @layer renderer-widgets @kind logic */
import { find, getActorByGameId, getDungeonByGameId, getItemByGameId, getScreen } from '@rotp/game-data';
import type { EntityKind } from '@rotp/game-data';
import type { DetectionContext } from '@rotp/navigation';
import { NO_LIVE_RECORDS } from '../LiveDataInspector.constants';
import type { LiveRecord } from '../LiveDataInspector.type';

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

const recordsFor = (kind: EntityKind, context: DetectionContext): readonly LiveRecord[] => {
  const { screenId, observations } = context;

  if (kind === 'screen') {
    const screen = screenId ? getScreen(screenId) : null;
    return screen ? [screen] : NO_LIVE_RECORDS;
  }

  if (kind === 'dungeon') {
    const palaceIndex = observations.liveGameId?.palaceIndex;
    if (!observations.isIndoors || palaceIndex == null) return NO_LIVE_RECORDS;
    const dungeon = getDungeonByGameId({ palaceIndex });
    return dungeon ? [dungeon] : NO_LIVE_RECORDS;
  }

  if (kind === 'connection') return observations.existingConnections;

  if (kind === 'check') return screenId ? find('check', check => check.screenId === screenId) : NO_LIVE_RECORDS;

  if (kind === 'actor') {
    return dedupeById((observations.liveSprites ?? [])
      .map(sprite => getActorByGameId({ spriteType: sprite.spriteType })));
  }

  if (kind === 'item') {
    return dedupeById((observations.grantedItems ?? [])
      .map(grant => getItemByGameId({ receiveItemId: grant.itemId })));
  }

  return NO_LIVE_RECORDS;
};

export { recordsFor };
