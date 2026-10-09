/* @layer shared-input @kind types */
import type { SdlAxisName, SdlButtonName } from '../../sdl-buttons';
import type { CoreBindings } from '../../../types/controls';

type CoreVerb = keyof CoreBindings;

interface AxisPosition {
  readonly axis: SdlAxisName;
  readonly direction: '+' | '-';
}

type CorePosition = SdlButtonName | AxisPosition;

export type { AxisPosition, CorePosition, CoreVerb };
