/* @layer renderer-lib @kind types */
import type { buildDeviceProfileFromSdlType } from '../..';
import type { FunctionMapping } from '@rotp/features';

type AxisEntry = ReturnType<typeof buildDeviceProfileFromSdlType>['axes'][number];

type AxisBinding = Extract<FunctionMapping['binding'], { type: 'gamepad-axis' }>;

export type { AxisEntry, AxisBinding };
