/* @layer renderer-components @kind component */
/**
 * ControllerCapabilityBadges — the bus type and haptic/motion capabilities
 * SDL reports directly for a claimed device, replacing the old path-string
 * connection guess. Renders nothing for a fact SDL didn't report (e.g. an
 * unavailable device carries no capability data — it was never opened).
 *
 * Icons are the same set ControllerStatusBar uses on the calibration screen,
 * so the two screens read as one system. The bar itself isn't reused here:
 * it carries its own bordered/background chrome meant for a standalone row,
 * which would double-box once nested inside this rail's already-bordered
 * device card — so only the icon set is shared, not the wrapper.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import usbIcon from '@iconify-icons/lucide/usb';
import bluetoothIcon from '@iconify-icons/lucide/bluetooth';
import vibrateIcon from '@iconify-icons/lucide/vibrate';
import gyroIcon from '@iconify-icons/lucide/rotate-3d';
import { Badge } from '../../../../design-system/primitives/Badge';
import type { ControllerCapabilityBadgesProps } from './ControllerCapabilityBadges.type';

const BUS_ICON = { usb: usbIcon, bluetooth: bluetoothIcon, unknown: null } as const;
const BUS_LABEL = { usb: 'USB', bluetooth: 'Bluetooth', unknown: null } as const;

const ControllerCapabilityBadges = (props: ControllerCapabilityBadgesProps) => {
  const { busType, hasRumble, hasGyro } = props;
  const busIcon = busType ? BUS_ICON[busType] : null;
  const busLabel = busType ? BUS_LABEL[busType] : null;

  return (
    <>
      {busIcon && busLabel && (
        <Badge variant="neutral" title={busLabel}>
          <IconifyIcon icon={busIcon} width={12} height={12} />
        </Badge>
      )}
      {hasRumble && (
        <Badge variant="neutral" title="Rumble">
          <IconifyIcon icon={vibrateIcon} width={12} height={12} />
        </Badge>
      )}
      {hasGyro && (
        <Badge variant="neutral" title="Gyro">
          <IconifyIcon icon={gyroIcon} width={12} height={12} />
        </Badge>
      )}
    </>
  );
};

export { ControllerCapabilityBadges };
