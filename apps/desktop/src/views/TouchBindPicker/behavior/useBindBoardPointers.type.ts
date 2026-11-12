/* @layer renderer-app @kind types */
import type { OrientationLayout } from '@rotp/features';
import type { InputBinding } from '@rotp/game-data';
import type { PxPoint, ScreenBox } from '@rotp/input-mapping';

interface BindBoardOptions {
  layout: OrientationLayout;
  box: ScreenBox;
  onPick: (binding: InputBinding) => void;
}

type BindSession =
  | { kind: 'dpad'; center: PxPoint }
  | { kind: 'stick'; base: PxPoint };

interface BindStick {
  base: PxPoint;
  knob: PxPoint;
}

export type { BindBoardOptions, BindSession, BindStick };
