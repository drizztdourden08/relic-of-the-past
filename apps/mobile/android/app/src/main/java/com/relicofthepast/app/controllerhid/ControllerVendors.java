/*
 * ControllerVendors — which USB devices the ControllerHid plugin treats as game
 * controllers, and how to find their HID interface. Mirrors the udev vendor list
 * in scripts/build/linux/99-relic-controllers.rules. Build-only on Android (no
 * compile on the Windows dev host). See docs/controllers/support-matrix.md.
 */
package com.relicofthepast.app.controllerhid;

import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbInterface;

final class ControllerVendors {

    // Nintendo, Sony, Microsoft, 8BitDo — same set the Linux udev rules grant.
    private static final int[] VENDORS = { 0x057e, 0x054c, 0x045e, 0x2dc8 };

    private ControllerVendors() {}

    static boolean isController(UsbDevice device) {
        for (int vid : VENDORS) {
            if (device.getVendorId() == vid) return true;
        }
        // Fall back to any device exposing an HID interface.
        return firstHidInterface(device) != null;
    }

    static UsbInterface firstHidInterface(UsbDevice device) {
        for (int i = 0; i < device.getInterfaceCount(); i++) {
            UsbInterface iface = device.getInterface(i);
            if (iface.getInterfaceClass() == UsbConstants.USB_CLASS_HID) return iface;
        }
        return null;
    }
}
