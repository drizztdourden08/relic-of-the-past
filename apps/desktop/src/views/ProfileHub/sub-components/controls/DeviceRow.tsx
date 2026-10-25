/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { UnavailableControllerNotice } from '@drizztdourden08/brock-input/renderer';
import { DeviceIcon } from './DeviceIcon';
import { useDeviceActions } from './useDeviceActions';
import type { DeviceRowProps } from './DeviceRow.type';
import './DeviceRow.css';

const DeviceRow = ({ entry, onAssign, onAddMapping }: DeviceRowProps) => {
  const { handleDragStart, handleAssign } = useDeviceActions(entry, onAssign);
  const { key, drag, family, iconSrc, meta, ready, unavailable } = entry;

  return (
    <Box className="device-row" draggable={ready} onDragStart={handleDragStart} data-device-id={key}>
      <ListItemRow
        icon={<DeviceIcon src={iconSrc} family={family} ready={ready} />}
        name={drag.displayName}
        meta={meta}
        onClick={ready ? handleAssign : undefined}
      />
      {unavailable && <UnavailableControllerNotice onAddMapping={onAddMapping} />}
    </Box>
  );
};

export { DeviceRow };
