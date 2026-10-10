/* @layer renderer-components @kind types */
import type { ReachState } from '@rotp/game-core';
import type { GridPos } from '../navigation-overlay.type';

type LayerIndex = 0 | 1;
type LayerGrids = [ReachState[][], ReachState[][]];
type LayerNode = { row: number; col: number; layer: LayerIndex };
type PlanePoint = { x: number; y: number };
type StepDir = readonly [number, number];
type LayerStep = { node: LayerNode; cost: number };
type LayerPathQuery = { start: GridPos; goal: GridPos; startLayer: LayerIndex; layerGrids: LayerGrids; merged: ReachState[][] };

type PlayerPathQuery = {
  player: PlanePoint;
  screenWorld: PlanePoint;
  goal: GridPos;
  reachable: ReachState[][];
  layerGrids: LayerGrids | undefined;
  startLayer: LayerIndex | undefined;
};

export type { LayerGrids, LayerIndex, LayerNode, LayerPathQuery, LayerStep, PlanePoint, PlayerPathQuery, StepDir };
