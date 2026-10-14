/* @layer renderer-components @kind types */
import type { HidControllerMap } from '../hid-calibration.type';

type SdlEntryFields = Pick<HidControllerMap, 'guid' | 'sdlMapping' | 'sdlType' | 'sdlHasButton' | 'sdlHasAxis'>;

export type { SdlEntryFields };
