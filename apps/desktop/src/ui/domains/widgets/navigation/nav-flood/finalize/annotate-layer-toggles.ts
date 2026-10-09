/* @layer renderer-widgets @kind logic */
import { wasmGetToggleFloorPositions } from '../../../../../../lib/game';
import { togglesLayer } from '../../../../../../lib/game/crossings';
import type { ConnectionInfo } from '@shared/game/navigation';

const annotateLayerToggles = (allConnections: ConnectionInfo[], isIndoors: boolean): void => {
  if (!isIndoors) return;
  const toggles = wasmGetToggleFloorPositions();
  for (const conn of allConnections) {
    if (togglesLayer(conn.edge, conn.positions, toggles)) conn.layerToggle = true;
  }
};

export { annotateLayerToggles };
