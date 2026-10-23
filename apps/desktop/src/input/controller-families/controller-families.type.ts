/* @layer renderer-lib @kind types */
import type { PadFamily } from '@drizztdourden08/brock-input';

type LayoutFamily = PadFamily | 'snes';

type DevicePositions = ReadonlySet<string>;

export type { DevicePositions, LayoutFamily };
