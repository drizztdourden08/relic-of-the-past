/* @layer renderer-widgets @kind types */
import type { RefObject } from 'react';
import type { ScreenId } from '@rotp/game-data';
import type { NavMode } from '../../../stores/navigation-overlay-store';
import type { NavigationOverlayState } from '../../../stores/navigation-overlay-store/navigation-overlay-store.type';
import type { InventoryEquipment } from '../../../nav-widget/nav-flood/nav-flood.type';

interface FloodOnTransitionOptions {
  enabled: boolean;
  isIndoors: boolean;
  linkX: number;
  linkY: number;
  onTrigger: () => void;
}

interface PlayerDebugState {
  playerX: number;
  playerY: number;
  relX: number;
  relY: number;
  tileMinCol: number;
  tileMaxCol: number;
  tileMinRow: number;
  tileMaxRow: number;
  map16Row: number;
  map16Col: number;
  liveScreenIndex: number;
  playerLayer: number | null;
  collisionType: number | null;
  staircaseType: number | null;
  inDoorway: number;
  doorAnimStep: number;
}

type RunHandler = () => void;

interface FloodRunParams {
  isIndoors: boolean;
  activeScreenIndex: number;
  overworldScreenIndex: number;
  screenName: string;
  screenId: ScreenId | null;
  equipment: InventoryEquipment;
  inventoryItems: ArrayLike<number>;
  actions: Pick<NavigationOverlayState, 'setScreenBundle' | 'setData' | 'setCrossings' | 'setAnnotations'>;
}

interface AutoFloodParams {
  autoRun: boolean;
  running: boolean;
  isIndoors: boolean;
  playerX: number;
  playerY: number;
  activeScreenIndex: number;
  equipment: InventoryEquipment & { sword: number };
  inventoryItems: ArrayLike<number>;
  runRef: RefObject<RunHandler | null>;
  setOverlayMode: (mode: NavMode) => void;
}

interface NavModeParams {
  mode: NavMode;
  running: boolean;
  runRef: RefObject<RunHandler | null>;
  setOverlayMode: (mode: NavMode) => void;
}

export type {
  AutoFloodParams, FloodOnTransitionOptions, FloodRunParams, NavModeParams, PlayerDebugState, RunHandler,
};
