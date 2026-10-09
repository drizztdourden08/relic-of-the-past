/* @layer renderer-widgets @kind logic */
import { wasmGetToggleFloorPositions } from '../../../../../../lib/game';
import { togglesLayer } from '@rotp/navigation';
import type { ConnectionInfo } from '@rotp/game-core';

const annotateLayerToggles = (allConnections: ConnectionInfo[], isIndoors: boolean): void => {
  if (!isIndoors) return;
  const toggles = wasmGetToggleFloorPositions();
  for (const conn of allConnections) {
    if (togglesLayer(conn.edge, conn.positions, toggles)) conn.layerToggle = true;
  }
};

export { annotateLayerToggles };
