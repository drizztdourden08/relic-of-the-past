/* @layer renderer-hooks @kind types */
import type { Facing, GloveLevel, OutfitId, StateGroup } from '@rotp/game-data';

type PoseLabels = {
  stateName: (action: number) => string;
  groupName: (group: StateGroup) => string;
  facingName: (facing: Facing) => string;
  allFacings: string;
  noFacingVariation: string;
  frameCount: (count: number) => string;
  actionId: (hex: string) => string;
  filterStates: (count: number) => string;
  bodyOnly: string;
  sheetSize: (cols: number, rows: number, width: number, height: number) => string;
  wearing: string;
  gloves: string;
  outfitName: (outfit: OutfitId) => string;
  gloveName: (gloves: GloveLevel) => string;
};

type PoseLabelsProp = { labels?: Partial<PoseLabels> };

export type { PoseLabels, PoseLabelsProp };
