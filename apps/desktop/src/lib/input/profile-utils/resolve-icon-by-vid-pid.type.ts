/* @layer renderer-lib @kind types */
import type { buildDeviceProfileFromSdlType } from '@shared/input';
import type { FunctionMapping } from '@rotp/features';

type AxisEntry = ReturnType<typeof buildDeviceProfileFromSdlType>['axes'][number];

type AxisBinding = Extract<FunctionMapping['binding'], { type: 'gamepad-axis' }>;

export type { AxisEntry, AxisBinding };
