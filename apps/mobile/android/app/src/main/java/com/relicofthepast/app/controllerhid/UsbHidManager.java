/*
 * UsbHidManager — Android USB-OTG host for game controllers, backing the
 * ControllerHid Capacitor plugin. Enumerates USB devices, requests permission,
 * opens HID interfaces, pumps interrupt/bulk IN reports off a per-device thread,
 * and exposes raw write + a generic USB transfer channel (claim/out/in) so the
 * renderer's Switch Pro 2 bulk-init runs over USB-OTG. Bluetooth controllers are
 * NOT handled here — Android exposes no raw HID for them; they use the Gamepad API.
 *
 * NOTE: this file is built only inside the Android app and CANNOT be compiled or
 * run on the Windows dev host (no JDK / Android SDK). It is a first implementation
 * pending on-device verification. See docs/controllers/support-matrix.md.
 */
package com.relicofthepast.app.controllerhid;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;
import android.os.Build;
import android.util.Base64;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class UsbHidManager {

    public interface HidEvents {
        void onReport(String deviceKey, int vendorId, int productId, String dataB64);
        void onDeviceOpened(String deviceKey, int vendorId, int productId, String product);
        void onDisconnect(String deviceKey, String product, String error);
        void onError(String deviceKey, String error);
    }

    private static final String ACTION_USB_PERMISSION = "com.relicofthepast.app.USB_PERMISSION";

    private final Context context;
    private final UsbManager usbManager;
    private final HidEvents events;

    private final Map<String, OpenHid> openDevices = new ConcurrentHashMap<>();
    private final Map<Integer, OpenUsb> usbHandles = new ConcurrentHashMap<>();
    private int nextHandle = 1;

    public UsbHidManager(Context context, HidEvents events) {
        this.context = context.getApplicationContext();
        this.usbManager = (UsbManager) this.context.getSystemService(Context.USB_SERVICE);
        this.events = events;
        registerReceivers();
    }

    static String deviceKey(UsbDevice d) {
        return String.format(Locale.US, "%04x:%04x", d.getVendorId(), d.getProductId());
    }

    private UsbDevice findByKey(String key) {
        for (UsbDevice d : usbManager.getDeviceList().values()) {
            if (deviceKey(d).equals(key)) return d;
        }
        return null;
    }

    private UsbDevice findByIds(int vid, int pid) {
        for (UsbDevice d : usbManager.getDeviceList().values()) {
            if (d.getVendorId() == vid && d.getProductId() == pid) return d;
        }
        return null;
    }

    // ── Enumeration (also ensures controller-class devices get opened) ──

    public java.util.List<UsbDevice> listControllers() {
        java.util.List<UsbDevice> out = new java.util.ArrayList<>();
        for (UsbDevice d : usbManager.getDeviceList().values()) {
            if (ControllerVendors.isController(d)) {
                out.add(d);
                ensureOpen(d);
            }
        }
        return out;
    }

    public java.util.List<String> openKeys() {
        return new java.util.ArrayList<>(openDevices.keySet());
    }

    private void ensureOpen(UsbDevice device) {
        String key = deviceKey(device);
        if (openDevices.containsKey(key)) return;
        if (!usbManager.hasPermission(device)) { requestPermission(device); return; }
        open(device);
    }

    // ── Permission ──

    private void requestPermission(UsbDevice device) {
        int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
                ? PendingIntent.FLAG_MUTABLE : 0;
        PendingIntent pi = PendingIntent.getBroadcast(
                context, 0, new Intent(ACTION_USB_PERMISSION).setPackage(context.getPackageName()), flags);
        usbManager.requestPermission(device, pi);
    }

    private void registerReceivers() {
        IntentFilter filter = new IntentFilter();
        filter.addAction(ACTION_USB_PERMISSION);
        filter.addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED);
        filter.addAction(UsbManager.ACTION_USB_DEVICE_DETACHED);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            context.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            context.registerReceiver(receiver, filter);
        }
    }

    private final BroadcastReceiver receiver = new BroadcastReceiver() {
        @Override public void onReceive(Context ctx, Intent intent) {
            String action = intent.getAction();
            UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
            if (device == null) return;
            if (ACTION_USB_PERMISSION.equals(action)) {
                if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) open(device);
                else events.onError(deviceKey(device), "USB permission denied");
            } else if (UsbManager.ACTION_USB_DEVICE_ATTACHED.equals(action)) {
                if (ControllerVendors.isController(device)) ensureOpen(device);
            } else if (UsbManager.ACTION_USB_DEVICE_DETACHED.equals(action)) {
                closeKey(deviceKey(device), device.getProductName());
            }
        }
    };

    // ── Open + read loop ──

    private void open(UsbDevice device) {
        String key = deviceKey(device);
        UsbInterface hid = ControllerVendors.firstHidInterface(device);
        if (hid == null) { events.onError(key, "no HID interface"); return; }
        UsbDeviceConnection conn = usbManager.openDevice(device);
        if (conn == null) { events.onError(key, "openDevice failed (permission?)"); return; }
        if (!conn.claimInterface(hid, true)) { conn.close(); events.onError(key, "claimInterface failed"); return; }

        UsbEndpoint epIn = null, epOut = null;
        for (int i = 0; i < hid.getEndpointCount(); i++) {
            UsbEndpoint ep = hid.getEndpoint(i);
            if (ep.getDirection() == UsbConstants.USB_DIR_IN && epIn == null) epIn = ep;
            else if (ep.getDirection() == UsbConstants.USB_DIR_OUT && epOut == null) epOut = ep;
        }
        if (epIn == null) { conn.close(); events.onError(key, "no IN endpoint"); return; }

        OpenHid handle = new OpenHid(device, conn, hid, epIn, epOut);
        openDevices.put(key, handle);
        events.onDeviceOpened(key, device.getVendorId(), device.getProductId(),
                device.getProductName() == null ? key : device.getProductName());
        startReadThread(key, handle);
    }

    private void startReadThread(String key, OpenHid h) {
        h.reading = true;
        h.thread = new Thread(() -> {
            int maxLen = h.epIn.getMaxPacketSize() > 0 ? h.epIn.getMaxPacketSize() : 64;
            byte[] buf = new byte[maxLen];
            while (h.reading) {
                int n = h.conn.bulkTransfer(h.epIn, buf, buf.length, 16);
                if (n > 0) {
                    String b64 = Base64.encodeToString(buf, 0, n, Base64.NO_WRAP);
                    events.onReport(key, h.device.getVendorId(), h.device.getProductId(), b64);
                } else if (n < 0 && !usbManager.getDeviceList().containsValue(h.device)) {
                    break; // device gone
                }
            }
        }, "hid-read-" + key);
        h.thread.start();
    }

    public boolean write(String key, byte[] data) {
        OpenHid h = openDevices.get(key);
        if (h == null || h.epOut == null) return false;
        int n = h.conn.bulkTransfer(h.epOut, data, data.length, 100);
        return n >= 0;
    }

    private void closeKey(String key, String product) {
        OpenHid h = openDevices.remove(key);
        if (h == null) return;
        h.reading = false;
        try { h.conn.releaseInterface(h.iface); } catch (Exception ignored) {}
        try { h.conn.close(); } catch (Exception ignored) {}
        events.onDisconnect(key, product == null ? key : product, null);
    }

    // ── Generic USB channel (vendor bulk-init driven from TS) ──

    public synchronized int usbOpen(int vid, int pid) {
        UsbDevice device = findByIds(vid, pid);
        if (device == null || !usbManager.hasPermission(device)) return -1;
        UsbDeviceConnection conn = usbManager.openDevice(device);
        if (conn == null) return -1;
        int handle = nextHandle++;
        usbHandles.put(handle, new OpenUsb(device, conn));
        return handle;
    }

    public UsbDevice usbDevice(int handle) {
        OpenUsb u = usbHandles.get(handle);
        return u == null ? null : u.device;
    }

    public boolean usbClaim(int handle, int index) {
        OpenUsb u = usbHandles.get(handle);
        if (u == null || index >= u.device.getInterfaceCount()) return false;
        UsbInterface iface = u.device.getInterface(index);
        boolean ok = u.conn.claimInterface(iface, true);
        if (ok) u.claimed.put(index, iface);
        return ok;
    }

    public boolean usbTransferOut(int handle, int endpointNumber, byte[] data) {
        OpenUsb u = usbHandles.get(handle);
        if (u == null) return false;
        UsbEndpoint ep = u.findEndpoint(endpointNumber, UsbConstants.USB_DIR_OUT);
        if (ep == null) return false;
        return u.conn.bulkTransfer(ep, data, data.length, 100) >= 0;
    }

    public byte[] usbTransferIn(int handle, int endpointNumber, int length) {
        OpenUsb u = usbHandles.get(handle);
        if (u == null) return new byte[0];
        UsbEndpoint ep = u.findEndpoint(endpointNumber, UsbConstants.USB_DIR_IN);
        if (ep == null) return new byte[0];
        byte[] buf = new byte[length];
        int n = u.conn.bulkTransfer(ep, buf, buf.length, 100);
        if (n <= 0) return new byte[0];
        byte[] out = new byte[n];
        System.arraycopy(buf, 0, out, 0, n);
        return out;
    }

    public void usbClose(int handle) {
        OpenUsb u = usbHandles.remove(handle);
        if (u == null) return;
        for (UsbInterface iface : u.claimed.values()) {
            try { u.conn.releaseInterface(iface); } catch (Exception ignored) {}
        }
        try { u.conn.close(); } catch (Exception ignored) {}
    }

    public void destroy() {
        for (String key : new java.util.ArrayList<>(openDevices.keySet())) closeKey(key, null);
        for (Integer h : new java.util.ArrayList<>(usbHandles.keySet())) usbClose(h);
        try { context.unregisterReceiver(receiver); } catch (Exception ignored) {}
    }

    // ── Handle holders ──

    private static final class OpenHid {
        final UsbDevice device; final UsbDeviceConnection conn; final UsbInterface iface;
        final UsbEndpoint epIn; final UsbEndpoint epOut;
        volatile boolean reading; Thread thread;
        OpenHid(UsbDevice d, UsbDeviceConnection c, UsbInterface i, UsbEndpoint in, UsbEndpoint out) {
            device = d; conn = c; iface = i; epIn = in; epOut = out;
        }
    }

    private static final class OpenUsb {
        final UsbDevice device; final UsbDeviceConnection conn;
        final Map<Integer, UsbInterface> claimed = new HashMap<>();
        OpenUsb(UsbDevice d, UsbDeviceConnection c) { device = d; conn = c; }
        UsbEndpoint findEndpoint(int number, int direction) {
            for (UsbInterface iface : claimed.values()) {
                for (int i = 0; i < iface.getEndpointCount(); i++) {
                    UsbEndpoint ep = iface.getEndpoint(i);
                    if (ep.getEndpointNumber() == number && ep.getDirection() == direction) return ep;
                }
            }
            return null;
        }
    }
}
