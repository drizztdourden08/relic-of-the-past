/* @layer renderer-components @kind types */
import type React from 'react';
import type { FloodFillResult } from '@rotp/game-core';
import type { ViewportInfo } from '../../../../../game';
import type { MouseState } from '@app/navigation-overlay/navigation-overlay.type';
import type { BuildTooltipLayersParams } from '@app/navigation-overlay/tile-inspector-classification.type';
import type { Sprites } from '@app/navigation-overlay/tile-inspector-tooltip/tile-inspector-tooltip.type';

interface HoverGeometryInput {
  event: React.MouseEvent<HTMLDivElement>;
  vp: ViewportInfo;
  result: FloodFillResult;
  width: number;
  height: number;
  isIndoors: boolean;
}

interface HoverGeometry {
  mx: number;
  my: number;
  scaleX: number;
  scaleY: number;
  viewLeft: number;
  viewTop: number;
  screenWorldX: number;
  screenWorldY: number;
  tileRow: number;
  tileCol: number;
}

interface HoverTooltipInput {
  geometry: HoverGeometry;
  vp: ViewportInfo;
  result: FloodFillResult;
  sprites: Sprites;
  width: number;
  height: number;
  roomIndex: number;
  isIndoors: boolean;
  palaceIndex: number;
  equipment: BuildTooltipLayersParams['equipment'];
  inventoryItems: BuildTooltipLayersParams['inventoryItems'];
  pathPreviewState?: MouseState;
}

interface TileHoverParams {
  width: number;
  height: number;
  result: FloodFillResult;
  roomIndex: number;
  isIndoors: boolean;
  palaceIndex: number;
  pathPreviewState?: MouseState;
  onHoverTile?: (row: number, col: number) => void;
  rectActive: boolean;
  handleRectMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  vpRef: React.RefObject<ViewportInfo | null>;
  spriteRef: React.RefObject<Sprites>;
}

export type { HoverGeometry, HoverGeometryInput, HoverTooltipInput, TileHoverParams };
