/* @layer renderer-components @kind types */
import type { ReachState } from '@rotp/game-core';
import type { LayerTileData } from './tooltip/tooltip.type';

type LayerDataBuilder = (attr: number, layer: 0 | 1, reach: ReachState, isAboveLayer: boolean) => LayerTileData;

export type { LayerDataBuilder };
