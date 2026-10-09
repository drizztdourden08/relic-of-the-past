/* @layer renderer-components @kind types */
import type { ReachState } from '@rotp/game-core';

type LayerIndex = 0 | 1;
type LayerGrids = [ReachState[][], ReachState[][]];
type LayerNode = { row: number; col: number; layer: LayerIndex };
type PlanePoint = { x: number; y: number };

export type { LayerGrids, LayerIndex, LayerNode, PlanePoint };
