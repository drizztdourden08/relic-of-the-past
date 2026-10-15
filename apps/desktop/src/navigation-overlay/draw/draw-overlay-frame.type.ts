/* @layer renderer-components @kind types */
import type { FloodFillResult } from '@rotp/game-core';
import type { useNavigationOverlayStore } from '@app/stores/navigation-overlay-store';
import type { MouseState } from '../navigation-overlay.type';
import type { PerLayerReach } from './dot-cell.type';
import type { ViewportInfo } from './draw.type';

type NavigationOverlayState = ReturnType<typeof useNavigationOverlayStore.getState>;

type OverlayDrawData = Pick<
  NavigationOverlayState,
  'results' | 'connections' | 'fallHoleSpawns' | 'crossings' | 'annotations' | 'hiddenKinds' | 'setLockedPath'
>;

interface OverlayFrameInput {
  ctx: CanvasRenderingContext2D;
  vp: ViewportInfo;
  width: number;
  height: number;
  result: FloodFillResult;
  isIndoors: boolean;
  activeScreenIndex: number;
  perLayer: PerLayerReach | null;
  mouseState: MouseState;
  overlay: OverlayDrawData;
}

export type { OverlayFrameInput };
