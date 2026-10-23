/* @layer renderer-components @kind constants */
import usbIcon from '@iconify-icons/lucide/usb';
import bluetoothIcon from '@iconify-icons/lucide/bluetooth';
import cableIcon from '@iconify-icons/lucide/cable';
import wifiIcon from '@iconify-icons/lucide/wifi';
import vibrateIcon from '@iconify-icons/lucide/vibrate';
import gyroIcon from '@iconify-icons/lucide/rotate-3d';
import detectedIcon from '@iconify-icons/lucide/circle-check';

const BUS_ICON = { usb: usbIcon, bluetooth: bluetoothIcon, unknown: null } as const;
const BUS_LABEL = { usb: 'USB', bluetooth: 'Bluetooth', unknown: null } as const;
const CONNECTION_ICON = { wired: cableIcon, wireless: wifiIcon, unknown: null } as const;
const CONNECTION_LABEL = { wired: 'Wired', wireless: 'Wireless', unknown: null } as const;

const CAPABILITY_ICON = { rumble: vibrateIcon, gyro: gyroIcon } as const;
const PRESENT_LABEL = { rumble: 'Rumble', gyro: 'Gyro' } as const;
const ABSENT_LABEL = { rumble: 'No rumble', gyro: 'No gyro' } as const;
const DETECTED_ICON = detectedIcon;

export {
  ABSENT_LABEL, BUS_ICON, BUS_LABEL, CAPABILITY_ICON, CONNECTION_ICON, CONNECTION_LABEL, DETECTED_ICON, PRESENT_LABEL,
};
