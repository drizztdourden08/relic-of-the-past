/* @layer shared-input @kind types */
import type { SdlAxisName, SdlButtonName, CoreBindings } from '@rotp/game-data';

type CoreVerb = keyof CoreBindings;

interface AxisPosition {
  readonly axis: SdlAxisName;
  readonly direction: '+' | '-';
}

type CorePosition = SdlButtonName | AxisPosition;

export type { AxisPosition, CorePosition, CoreVerb };
