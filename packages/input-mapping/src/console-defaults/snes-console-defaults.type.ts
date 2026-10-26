/* @layer shared-input @kind types */
import type { SdlAxisName, SdlButtonName, SnesButton } from '@rotp/game-data';

interface AxisConsoleDefault {
  readonly '-'?: SnesButton;
  readonly '+'?: SnesButton;
}

interface SnesConsoleDefaults {
  readonly buttons: Partial<Record<SdlButtonName, SnesButton>>;
  readonly axes?: Partial<Record<SdlAxisName, AxisConsoleDefault>>;
}

export type { AxisConsoleDefault, SnesConsoleDefaults };
