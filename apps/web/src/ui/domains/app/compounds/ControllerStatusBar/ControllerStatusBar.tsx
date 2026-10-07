/* @layer renderer-components @kind component */
/**
 * The second row of a controller card: connection, rumble, and gyro rendered as
 * icons instead of bare words, plus the device's identifier in monospace.
 * Renders nothing for a feature the device doesn't have.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import usbIcon from '@iconify-icons/lucide/usb';
import bluetoothIcon from '@iconify-icons/lucide/bluetooth';
import cableIcon from '@iconify-icons/lucide/cable';
import wifiIcon from '@iconify-icons/lucide/wifi';
import vibrateIcon from '@iconify-icons/lucide/vibrate';
import gyroIcon from '@iconify-icons/lucide/rotate-3d';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import type { ControllerStatusBarProps } from './ControllerStatusBar.type';
import './ControllerStatusBar.css';

const BUS_ICON = { usb: usbIcon, bluetooth: bluetoothIcon, unknown: null } as const;
const BUS_LABEL = { usb: 'USB', bluetooth: 'Bluetooth', unknown: null } as const;
// Fallback shown only when `busType` is unknown: a bus-agnostic wired/wireless
// read, never a stand-in for USB/Bluetooth. See ControllerStatusBar.type.ts.
const CONNECTION_ICON = { wired: cableIcon, wireless: wifiIcon, unknown: null } as const;
const CONNECTION_LABEL = { wired: 'Wired', wireless: 'Wireless', unknown: null } as const;

const ControllerStatusBar = (props: ControllerStatusBarProps) => {
  const { busType, connectionState, hasRumble, hasGyro, idLabel } = props;
  // Never show both a bus chip and a wired/wireless chip: the fallback only
  // applies when the specific bus type is unknown.
  const connectionIcon = busType ? BUS_ICON[busType] : (connectionState ? CONNECTION_ICON[connectionState] : null);
  const connectionLabel = busType ? BUS_LABEL[busType] : (connectionState ? CONNECTION_LABEL[connectionState] : null);

  if (!connectionIcon && !hasRumble && !hasGyro && !idLabel) return null;

  return (
    <Box className="controller-status-bar">
      {connectionIcon && connectionLabel && (
        <Box className="controller-status-bar__item" title={connectionLabel}>
          <IconifyIcon icon={connectionIcon} width={14} height={14} />
          <Text>{connectionLabel}</Text>
        </Box>
      )}
      {hasRumble && (
        <Box className="controller-status-bar__item" title="Rumble">
          <IconifyIcon icon={vibrateIcon} width={14} height={14} />
          <Text>Rumble</Text>
        </Box>
      )}
      {hasGyro && (
        <Box className="controller-status-bar__item" title="Gyro">
          <IconifyIcon icon={gyroIcon} width={14} height={14} />
          <Text>Gyro</Text>
        </Box>
      )}
      {idLabel && (
        <Text className="controller-status-bar__id">{idLabel}</Text>
      )}
    </Box>
  );
};

export { ControllerStatusBar };
