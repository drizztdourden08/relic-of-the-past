/* @layer renderer-widgets @kind logic */
import { getItemByGameId } from '@rotp/game-data';
import type { DetectionContext } from '@rotp/navigation';
import type { LiveRecord } from '../LiveDataInspector.type';
import { dedupeById } from './dedupe-by-id';

const itemRecords = (context: DetectionContext): readonly LiveRecord[] =>
  dedupeById((context.observations.grantedItems ?? [])
    .map(grant => getItemByGameId({ receiveItemId: grant.itemId })));

export { itemRecords };
