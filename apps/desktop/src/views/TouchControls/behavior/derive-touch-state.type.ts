/* @layer renderer-app @kind types */
import type { PadState } from '@rotp/input-mapping';
import type { TouchViewState } from '../TouchControls.type';

interface Derived {
  view: TouchViewState;
  pad: PadState;
}

export type { Derived };
