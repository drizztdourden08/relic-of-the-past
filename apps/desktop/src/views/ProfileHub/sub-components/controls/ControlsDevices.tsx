/* @layer renderer-components @kind component */
import { useCallback, useLayoutEffect, useMemo } from 'react';
import { Box, EmptyState } from '@drizztdourden08/tessera/primitives';
import { SidePanel } from '@drizztdourden08/tessera/composites';
import { useStoredFold } from '../../../../hooks/useStoredFold';
import { RescanButton } from '@drizztdourden08/brock-input/renderer';
import { DeviceRow } from './DeviceRow';
import { DeviceRailButton } from './DeviceRailButton';
import { keyboardEntry } from './keyboard-entry';
import { controllerGroupEntry } from './controller-group-entry';
import { DEVICES_FOLD_KEY, SIDE_PANEL_SIZE } from './controls.constants';
import { sideSlotClass } from './side-slot-class';
import type { DeviceAssignInfo } from './DeviceRow.type';
import type { ControlsSideProps } from './controls.type';

const ControlsDevices = ({ ctrl, narrow }: ControlsSideProps) => {
  const { filteredDevices, controllerGroups, setConfirmPreset, addMapping } = ctrl;
  const { collapsed, toggle, collapse } = useStoredFold(DEVICES_FOLD_KEY, false);
  useLayoutEffect(() => {
    if (narrow) collapse();
  }, [narrow, collapse]);
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
    <Box className={sideSlotClass('end', collapsed)}>
      <SidePanel
        side="end"
        title="Devices"
        {...SIDE_PANEL_SIZE}
        storageKey="controls:devices-width"
        action={rescan}
        railItems={rail}
        collapsed={collapsed}
        onCollapsedChange={toggle}
        containers={[{
          title: 'Connected devices',
          content: (
            <>
              {entries.map((entry) => (
                <DeviceRow key={entry.key} entry={entry} onAssign={handleAssign} onAddMapping={addMapping} />
              ))}
              {entries.length === 0 && <EmptyState message="No devices detected" />}
            </>
          ),
        }]}
      />
    </Box>
  );
};

export { ControlsDevices };
