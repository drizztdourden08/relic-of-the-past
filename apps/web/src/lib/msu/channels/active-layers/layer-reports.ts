/* @layer renderer-lib @kind logic */
import type { ActiveLayer, LayerReport } from '../channel.type';

const layerReports = (layers: ActiveLayer[]): LayerReport[] => layers.map((entry) => ({
  layerId: entry.layerId,
  layerName: entry.layerName,
  modeKind: entry.modeKind,
  ...entry.scheduler.activity(),
}));

export { layerReports };
