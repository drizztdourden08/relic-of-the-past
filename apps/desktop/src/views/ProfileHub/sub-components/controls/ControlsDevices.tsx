/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { EmptyState, Text } from '@drizztdourden08/tessera/primitives';
import { ListPanel, useStoredFold } from '../../../../compounds/ListPanel';
import { RescanButton } from '../../../../compounds/RescanButton';
import { DeviceRow } from './DeviceRow';
import { DeviceRailButton } from './DeviceRailButton';
import { keyboardEntry } from './keyboard-entry';
import { controllerGroupEntry } from './controller-group-entry';
import { DEVICES_FOLD_KEY } from './controls.constants';
import type { DeviceAssignInfo } from './DeviceRow.type';
import type { CtrlProps } from './controls.type';

const ControlsDevices = ({ ctrl }: CtrlProps) => {
  const { filteredDevices, controllerGroups, setConfirmPreset, addMapping } = ctrl;
  const { collapsed, toggle } = useStoredFold(DEVICES_FOLD_KEY, false);
  const entries = useMemo(() => [
    ...filteredDevices.filter((d) => d.type === 'keyboard').map(keyboardEntry),
    ...controllerGroups.map(controllerGroupEntry),
  ], [filteredDevices, controllerGroups]);

  const handleAssign = useCallback((d: DeviceAssignInfo) => {
    if (!d.sdlType) return;
    setConfirmPreset({ sdlType: d.sdlType, deviceName: d.displayName, vid: d.vendorId ?? '', pid: d.productId ?? '' });
  }, [setConfirmPreset]);

  const rescan = <RescanButton isPending={ctrl.isRescanPending} onRescan={ctrl.handleRescan} />;
  const rail = entries.map((entry) => <DeviceRailButton key={entry.key} entry={entry} onAssign={handleAssign} />);

  return (
    <ListPanel side="end" title="Devices" action={rescan} rail={rail} collapsed={collapsed} onToggle={toggle}>
      {entries.map((entry) => (
        <DeviceRow key={entry.key} entry={entry} onAssign={handleAssign} onAddMapping={addMapping} />
      ))}
      {entries.length === 0 && <EmptyState message="No devices detected" />}
      <Text variant="caption" tone="muted">Click a device or drag it onto the bindings to assign it.</Text>
    </ListPanel>
  );
};

export { ControlsDevices };
