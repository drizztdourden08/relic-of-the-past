/* @layer renderer-widgets @kind logic */
import type { ConnectionRecord, ScreenId } from '@shared/game/data';
import type { ScreenObservations } from '@shared/game/recommendations';
import { auditableFromHere } from '../screen-endpoint';

const readIndoorEdgeDataset = (observations: ScreenObservations, screenId: ScreenId | null): readonly ConnectionRecord[] => {
  if (!screenId || !observations.isIndoors) return [];
  return observations.existingConnections.filter(c => c.kind === 'edge' && auditableFromHere(screenId, c));
};

export { readIndoorEdgeDataset };
