/* @layer renderer-components @kind types */
import type { ControlSchemeId, TouchControlsSettings } from '@rotp/features';
import type { SlotAssignment, SlotIndex } from '@rotp/game-data';
import type { SettingsChange } from './controls-settings.type';

interface BuildControlsTabsArgs {
  scheme: ControlSchemeId;
  experimental: boolean;
  cheatsEnabled: boolean;
  hapticsEnabled: boolean;
  touch: TouchControlsSettings;
  mobile: boolean;
  assignments: Readonly<Record<SlotIndex, SlotAssignment>>;
  onChange: SettingsChange;
}

export type { BuildControlsTabsArgs };
