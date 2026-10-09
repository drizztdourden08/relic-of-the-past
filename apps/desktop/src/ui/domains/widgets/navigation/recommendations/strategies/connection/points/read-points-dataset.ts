/* @layer renderer-widgets @kind logic */
import type { ConnectionRecord, ScreenId } from '@rotp/game-data';
import type { ScreenObservations } from '@shared/game/recommendations';
import { auditableFromHere } from '../screen-endpoint';

const unprovableIndoors = (observations: ScreenObservations, record: ConnectionRecord): boolean =>
  observations.isIndoors && (record.kind === 'hole' || record.kind === 'drop');

const readPointsDataset = (observations: ScreenObservations, screenId: ScreenId | null): readonly ConnectionRecord[] => {
  if (!screenId) return [];
  return observations.existingConnections.filter(c => (
    c.kind !== 'edge' && !unprovableIndoors(observations, c) && auditableFromHere(screenId, c)
  ));
};

export { readPointsDataset };
