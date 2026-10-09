/* @layer shared-input @kind types */
import type { SnesButton } from '../../types/controls';
import type { SdlAxisName, SdlButtonName, SdlGamepadType } from '../sdl-buttons';

type ConsoleButton = SnesButton;

interface AxisConsoleDefault {
  readonly '-'?: ConsoleButton;
  readonly '+'?: ConsoleButton;
}

interface FamilyMetadata {
  readonly types: readonly SdlGamepadType[];
  readonly brandLogoKey?: string;
  readonly deviceName?: (sdlName: string) => string;
  readonly buttonLabels?: Partial<Record<SdlButtonName, string>>;
  readonly axisLabels?: Partial<Record<SdlAxisName, string>>;
  readonly buttonIcons?: Partial<Record<SdlButtonName, string>>;
  readonly axisIcons?: Partial<Record<SdlAxisName, string>>;
  readonly consoleDefaults?: Partial<Record<SdlButtonName, ConsoleButton>>;
  readonly axisConsoleDefaults?: Partial<Record<SdlAxisName, AxisConsoleDefault>>;
  readonly triggerPressThreshold?: number;
  readonly shapeVibration?: (intensity: number) => number;
  readonly minDurationMs?: number;
}

interface DeviceOverride extends Omit<FamilyMetadata, 'types'> {
  readonly vendorId: string;
  readonly productId: string;
}

type ResolvedControlCategory = 'face' | 'shoulder' | 'trigger' | 'dpad' | 'stick' | 'system';

interface ResolvedControl {
  readonly position: SdlButtonName | SdlAxisName;
  readonly kind: 'button' | 'axis';
  readonly label: string;
  readonly icon: string;
  readonly category: ResolvedControlCategory;
  readonly pressThreshold?: number;
}

interface ResolvedDevice {
  readonly deviceKey: string;
  readonly name: string;
  readonly sdlType: SdlGamepadType;
  readonly brandLogoKey: string;
  readonly hasRumble: boolean;
  readonly hasGyro: boolean;
  readonly connection: string;
  readonly controls: readonly ResolvedControl[];
}

export type {
  AxisConsoleDefault,
  ConsoleButton,
  DeviceOverride,
  FamilyMetadata,
  ResolvedControl,
  ResolvedControlCategory,
  ResolvedDevice,
  SdlAxisName,
  SdlButtonName,
  SdlGamepadType,
};
