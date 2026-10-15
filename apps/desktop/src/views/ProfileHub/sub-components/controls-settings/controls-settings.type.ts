/* @layer renderer-components @kind types */
import type { GameSettings, ControlSchemeId, FunctionAction, FunctionMapping } from '@rotp/features';
import type { CoreVerb, ResolvedControl, DetectedDevice, InputProfile } from '@rotp/input-mapping';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { HudLayout } from '@rotp/hud';
import type { ButtonIcon, CoreBindings, InputBinding, ModernSlot, SlotAssignment, SlotIndex, SnesButton } from '@rotp/game-data';

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

interface BindMappingParams<T extends object> {
  mapping: T;
  binding: InputBinding;
  vid: string | null;
  pid: string | null;
}

interface BindSnesButtonParams {
  profile: InputProfile;
  button: SnesButton;
  binding: InputBinding;
  vid: string | null;
  pid: string | null;
}

interface BindFunctionActionParams {
  mappings: readonly FunctionMapping[];
  action: FunctionAction;
  binding: InputBinding;
  vid: string | null;
  pid: string | null;
}

type DisplayFunctionMapping = FunctionMapping & { deviceIconUrl?: string | null };

interface UseDisplayFunctionMappingsArgs {
  functionMappings: FunctionMapping[];
  activeProfile: InputProfile | null;
  devices: DetectedDevice[];
}

interface UseRebindHandlersArgs {
  setListeningFor: (target: ListeningTarget | null) => void;
}

type ProfileMapping = InputProfile['mappings'][number];

interface GamepadDisplayMappingParams {
  mapping: ProfileMapping;
  multiController: boolean;
  devices: DetectedDevice[];
}

interface ButtonDisplayMappingParams {
  button: SnesButton;
  mapping: ProfileMapping | undefined;
  multiController: boolean;
  devices: DetectedDevice[];
}

interface ReadDroppedPresetParams {
  transfer: DataTransfer;
  devices: DetectedDevice[];
}

interface PresetMappingsParams {
  sdlType: string;
  vid: string;
  pid: string;
}

interface BuildPresetProfileParams {
  preset: PendingPreset;
  profile: InputProfile;
  scheme: ControlSchemeId;
  entries: DeviceEntry[];
}

interface ResolveCoreBindingsParams {
  activeProfile: InputProfile | null;
  controls: ResolvedControl[];
  isKeyboard: boolean;
}

interface UseProfileLoaderArgs {
  profileId: string;
  activeInputProfileId: string | null;
  setProfiles: (profiles: InputProfile[]) => void;
  setActiveProfile: (profile: InputProfile | null) => void;
}

export type {
  AbsentAssignment, BindFunctionActionParams, BindMappingParams, BindSnesButtonParams, BuildPresetProfileParams, PresetMappingsParams, ReadDroppedPresetParams, ResolveCoreBindingsParams,
  ButtonDisplayMappingParams, ControlsTab, GamepadDisplayMappingParams, CoreIcons, DeviceIdentity, DisplayFunctionMapping, ListeningTarget, LiveFamilyIconParams,
  PendingPreset, RequiredInput, SchemeLayout, SlotDisplay, UseBindingStateArgs,
  UseControlsSettingsArgs, UseCoreIconsArgs, UseDisplayFunctionMappingsArgs, UseDisplayMappingsArgs,
  UseDragDropArgs, UseHapticsToggleArgs, UseModernSchemeArgs, UseProfileActionsArgs,
  UseProfileLoaderArgs, UseRebindHandlersArgs, UseSchemeLayoutArgs,
};
