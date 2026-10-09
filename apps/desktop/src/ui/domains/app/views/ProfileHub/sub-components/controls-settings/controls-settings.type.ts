/* @layer renderer-components @kind types */
import type { GameSettings } from '@rotp/features';
import type { CoreVerb } from '@rotp/input-mapping';
import type { ControlSchemeId } from '@rotp/features';
import type { ResolvedControl } from '@rotp/input-mapping';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { HudLayout } from '@rotp/hud';
import type { ButtonIcon, CoreBindings, InputBinding, ModernSlot, SlotAssignment, SlotIndex, SnesButton } from '@rotp/game-data';
import type { DetectedDevice, InputProfile } from '@rotp/input-mapping';
import type { FunctionAction } from '@rotp/features';

type SettingsChange = (patch: Partial<GameSettings>) => void;

interface UseControlsSettingsArgs {
  settings: GameSettings;
  onChange: SettingsChange;
  profileId: string;
}

type ControlsTab = 'controls' | 'modern' | 'shortcuts' | 'cheats';

type ListeningTarget =
  | { type: 'snes'; button: SnesButton }
  | { type: 'function'; action: FunctionAction }
  | { type: 'core'; verb: CoreVerb }
  | { type: 'slot'; slot: ModernSlot };

interface UseBindingStateArgs {
  settings: GameSettings;
  onChange: SettingsChange;
  activeProfile: InputProfile | null;
  updateActiveProfile: (profile: InputProfile) => void;
  devices: DetectedDevice[];
  applyCoreBinding: (verb: CoreVerb, binding: InputBinding) => void;
  applySlotBinding: (slot: ModernSlot, binding: InputBinding) => void;
}

type CoreIcons = Partial<Record<CoreVerb, ButtonIcon | null>>;

interface UseCoreIconsArgs {
  activeProfile: InputProfile | null;
  devices: DetectedDevice[];
  core: CoreBindings;
}

interface UseDisplayMappingsArgs {
  activeProfile: InputProfile | null;
  devices: DetectedDevice[];
}

interface RequiredInput {
  type: 'keyboard' | 'gamepad';
  label: string;
  iconSrc: string;
  connected: boolean;
}

interface UseDragDropArgs {
  devices: DetectedDevice[];
  entries: DeviceEntry[];
  scheme: ControlSchemeId;
  activeProfile: InputProfile | null;
  updateActiveProfile: (profile: InputProfile) => void;
}

interface PendingPreset {
  sdlType: string;
  deviceName: string;
  vid: string;
  pid: string;
}

interface UseHapticsToggleArgs {
  settings: GameSettings;
  onChange: SettingsChange;
}

interface UseModernSchemeArgs {
  settings: GameSettings;
  onChange: SettingsChange;
  activeProfile: InputProfile | null;
  updateActiveProfile: (profile: InputProfile) => void;
  controls: ResolvedControl[];
}

interface AbsentAssignment {
  index: SlotIndex;
  assignment: SlotAssignment;
}

interface UseProfileActionsArgs {
  settings: GameSettings;
  onChange: SettingsChange;
  profileId: string;
}

interface UseSchemeLayoutArgs {
  activeProfile: InputProfile | null;
  updateActiveProfile: (profile: InputProfile) => void;
}

interface SchemeLayout {
  layoutId: string;
  layouts: readonly HudLayout[];
  setLayoutId: (id: string) => void;
}

interface SlotDisplay {
  position?: ModernSlot['position'];
  icon?: ModernSlot['icon'];
  label?: string;
}

interface DeviceIdentity {
  vid: string;
  pid: string;
  sdlType?: string | null;
}

interface LiveFamilyIconParams {
  vid: string;
  pid: string;
  devices: DetectedDevice[];
}

export type {
  AbsentAssignment, ControlsTab, CoreIcons, DeviceIdentity, ListeningTarget, LiveFamilyIconParams,
  PendingPreset, RequiredInput, SchemeLayout, SettingsChange, SlotDisplay, UseBindingStateArgs,
  UseControlsSettingsArgs, UseCoreIconsArgs, UseDisplayMappingsArgs, UseDragDropArgs,
  UseHapticsToggleArgs, UseModernSchemeArgs, UseProfileActionsArgs, UseSchemeLayoutArgs,
};
