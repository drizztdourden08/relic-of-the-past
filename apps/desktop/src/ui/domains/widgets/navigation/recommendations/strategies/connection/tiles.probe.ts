/* @layer renderer-widgets @kind data */
import type { FieldProbe } from '@rotp/navigation';
import { tilesProbeApplies } from './tiles/tiles-probe-applies';
import { readTilesProbe } from './tiles/read-tiles-probe';

const TILES_PROBE: FieldProbe<'connection'> = {
  path: 'placement.tiles',
  label: 'Tile footprint',
  source: 'native:room-boundaries',
  confidence: 'certain',
  applies: tilesProbeApplies,
  read: readTilesProbe,
};

export { TILES_PROBE };
