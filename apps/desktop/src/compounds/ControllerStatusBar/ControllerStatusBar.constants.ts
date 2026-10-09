/* @layer renderer-components @kind constants */
import usbIcon from '@iconify-icons/lucide/usb';
import bluetoothIcon from '@iconify-icons/lucide/bluetooth';
import cableIcon from '@iconify-icons/lucide/cable';
import wifiIcon from '@iconify-icons/lucide/wifi';

const BUS_ICON = { usb: usbIcon, bluetooth: bluetoothIcon, unknown: null } as const;
const BUS_LABEL = { usb: 'USB', bluetooth: 'Bluetooth', unknown: null } as const;
const CONNECTION_ICON = { wired: cableIcon, wireless: wifiIcon, unknown: null } as const;
const CONNECTION_LABEL = { wired: 'Wired', wireless: 'Wireless', unknown: null } as const;

export { BUS_ICON, BUS_LABEL, CONNECTION_ICON, CONNECTION_LABEL };
