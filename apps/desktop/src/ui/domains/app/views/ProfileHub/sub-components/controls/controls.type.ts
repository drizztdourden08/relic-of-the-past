/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { CoreVerb } from '@shared/input/scheme';
import type { HudLayout } from '@shared/types/hud';
import type { AssignedDevice, DetectedDevice, InputProfile } from '@shared/types/controls/devices/devices.type';
import type { ButtonIcon, CoreBindings, InputBinding, ModernSlot, SlotAssignment, SnesButton } from '@rotp/game-data';
import type { FunctionAction, FunctionMapping } from '@rotp/features';
import type { ControllerDeviceGroup } from '../../../../../../../lib/input/controller-device-groups';
import type { AbsentAssignment, ControlsTab } from '../controls-settings/controls-settings.type';
import type { useControlsSettings } from '../controls-settings';
import type { DeviceAssignInfo } from './DeviceCard.type';

type ControlsCtrl = ReturnType<typeof useControlsSettings>;

interface CtrlProps {
  ctrl: ControlsCtrl;
}

interface CheatBindingsTabProps extends CtrlProps {
  cheatsEnabled: boolean;
  onOpenCheatsSettings: () => void;
}

interface ControlsMainProps extends CheatBindingsTabProps {
  onOpenHudStyle: () => void;
}

interface ControlsTabItem {
  id: ControlsTab;
  label: string;
  disabled?: boolean;
  reason?: string;
}

interface ControlsTabsProps {
  tabs: readonly ControlsTabItem[];
  activeTab: ControlsTab;
  onTabChange: (tab: ControlsTab) => void;
}

interface ControlsTabButtonProps {
  tab: ControlsTabItem;
  active: boolean;
  onTabChange: (tab: ControlsTab) => void;
}

interface CoreVerbGroup {
  id: string;
  title: string;
  hint?: string;
  verbs: readonly CoreVerb[];
}

interface CoreBindingsGroupProps {
  core: CoreBindings;
  icons: Partial<Record<CoreVerb, ButtonIcon | null>>;
  onRebind: (verb: CoreVerb) => void;
}

interface CoreVerbRowProps {
  verb: CoreVerb;
  groupTitle: string;
  binding: InputBinding;
  icon?: ButtonIcon | null;
  onRebind: (verb: CoreVerb) => void;
}

interface DeviceDragInfo {
  id: string;
  displayName: string;
  sdlType: string | null;
  vendorId: string | null;
  productId: string | null;
}

interface HapticsToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

interface InputProfileListProps {
  profiles: InputProfile[];
  activeId: string | null;
  initialEditId?: string | null;
  onSelect: (profile: InputProfile) => void;
  onDelete: (profile: InputProfile) => void;
  onRename: (profile: InputProfile, newName: string) => void;
  onCreate: () => void;
}

interface InputProfileItemProps {
  profile: InputProfile;
  active: boolean;
  editing: boolean;
  editValue: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onSelect: (profile: InputProfile) => void;
  onDelete: (profile: InputProfile) => void;
  onStartEditing: (profile: InputProfile) => void;
  onCommitEdit: (profile: InputProfile) => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string) => void;
}

interface SidebarProfileButtonProps {
  profile: InputProfile;
  active: boolean;
  onSelect: (profile: InputProfile) => void;
}

interface SchemeBannerProps {
  onOpenHudStyle: () => void;
}

interface SchemeLayoutRowProps {
  value: string;
  layouts: readonly HudLayout[];
  disabled?: boolean;
  onChange: (layoutId: string) => void;
}

interface SlotRowProps {
  slot: ModernSlot;
  assignment?: SlotAssignment;
  onRebind: (slot: ModernSlot) => void;
  onRemove: (index: ModernSlot['index']) => void;
}

interface BindingListHeaderProps {
  middleLabel?: string;
  actionLabel?: string;
}

interface BindingRowProps {
  actionLabel: string;
  middleLabel?: string;
  middleIconUrl?: string | null;
  binding: InputBinding;
  bindingIcon?: ButtonIcon | null;
  deviceIconUrl?: string | null;
  onRebind: () => void;
  onClear?: () => void;
}

type DisplayFunctionMapping = FunctionMapping & { deviceIconUrl?: string | null };

interface FunctionBindingRowProps {
  mapping: DisplayFunctionMapping;
  onRebind: (action: FunctionAction) => void;
  onClear: (action: FunctionAction) => void;
}

interface SnesBindingRowProps {
  snesButton: SnesButton;
  binding: InputBinding;
  bindingIcon?: ButtonIcon | null;
  deviceIconUrl?: string | null;
  onRebind: (button: SnesButton) => void;
  onClear: (button: SnesButton) => void;
}

interface BindingListenerProps {
  actionLabel: string;
  onCapture: (binding: InputBinding, sourceDeviceKey?: string, vendorId?: string | null, productId?: string | null) => void;
  onCancel: () => void;
}

interface AdapterDeviceCardProps {
  group: ControllerDeviceGroup;
  onAssign?: (device: DeviceAssignInfo) => void;
  onAddMapping?: (mapping: string) => Promise<boolean>;
}

interface AssignedDeviceCardProps {
  assigned: AssignedDevice;
  liveDevice: DetectedDevice | null;
  onUnassign: () => void;
}

interface AbsentAssignmentsProps {
  entries: AbsentAssignment[];
}

export type {
  AbsentAssignmentsProps, AdapterDeviceCardProps, AssignedDeviceCardProps, BindingListenerProps,
  BindingListHeaderProps, BindingRowProps, CheatBindingsTabProps, ControlsCtrl, ControlsMainProps,
  ControlsTabButtonProps, ControlsTabItem, ControlsTabsProps, CoreBindingsGroupProps, CoreVerbGroup,
  CoreVerbRowProps, CtrlProps, DeviceDragInfo, DisplayFunctionMapping, FunctionBindingRowProps,
  HapticsToggleProps, InputProfileItemProps, InputProfileListProps, SchemeBannerProps,
  SchemeLayoutRowProps, SidebarProfileButtonProps, SlotRowProps, SnesBindingRowProps,
};
