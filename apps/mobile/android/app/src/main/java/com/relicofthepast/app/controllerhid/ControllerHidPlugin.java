/*
 * ControllerHidPlugin — Capacitor bridge for Android USB-OTG controllers. Exposes
 * raw HID (enumerate/getOpenKeys/write) plus a generic USB channel (usbOpen/claim/
 * transfer/close) consumed by the renderer's WebUSB-shaped shim for vendor bulk-init.
 * Emits report/deviceOpened/disconnect/error events. Registered in MainActivity.
 *
 * Build-only on Android — not compiled on the Windows dev host. First implementation
 * pending on-device verification. See docs/controllers/support-matrix.md.
 */
package com.relicofthepast.app.controllerhid;

import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Locale;

@CapacitorPlugin(name = "ControllerHid")
public class ControllerHidPlugin extends Plugin implements UsbHidManager.HidEvents {

    private UsbHidManager manager;

    @Override
    public void load() {
        manager = new UsbHidManager(getContext(), this);
    }

    @Override
    protected void handleOnDestroy() {
        if (manager != null) manager.destroy();
    }

    // ── Raw HID ──

    @PluginMethod
    public void enumerate(PluginCall call) {
        JSArray devices = new JSArray();
        for (UsbDevice d : manager.listControllers()) {
            JSObject o = new JSObject();
            o.put("vendorId", String.format(Locale.US, "%04x", d.getVendorId()));
            o.put("productId", String.format(Locale.US, "%04x", d.getProductId()));
            o.put("product", d.getProductName() == null ? "" : d.getProductName());
            o.put("manufacturer", d.getManufacturerName() == null ? "" : d.getManufacturerName());
            o.put("path", d.getDeviceName());
            o.put("serialNumber", JSObject.NULL);
            devices.put(o);
        }
        JSObject ret = new JSObject();
        ret.put("devices", devices);
        call.resolve(ret);
    }

    @PluginMethod
    public void getOpenKeys(PluginCall call) {
        JSArray keys = new JSArray();
        for (String k : manager.openKeys()) keys.put(k);
        JSObject ret = new JSObject();
        ret.put("keys", keys);
        call.resolve(ret);
    }

    @PluginMethod
    public void write(PluginCall call) {
        String key = call.getString("deviceKey", "");
        byte[] data = toBytes(call.getArray("data"));
        JSObject ret = new JSObject();
        ret.put("ok", manager.write(key, data));
        call.resolve(ret);
    }

    @PluginMethod
    public void vibrate(PluginCall call) {
        // Generic HID rumble is controller-specific; presets drive haptics via write().
        JSObject ret = new JSObject();
        ret.put("ok", false);
        ret.put("error", "vibratePattern unsupported on Android USB-HID");
        call.resolve(ret);
    }

    // ── Generic USB channel ──

    @PluginMethod
    public void usbOpen(PluginCall call) {
        int vid = call.getInt("vendorId", 0);
        int pid = call.getInt("productId", 0);
        int handle = manager.usbOpen(vid, pid);
        JSObject ret = new JSObject();
        ret.put("handle", handle);
        ret.put("interfaces", handle < 0 ? new JSArray() : describeInterfaces(manager.usbDevice(handle)));
        call.resolve(ret);
    }

    @PluginMethod
    public void usbClaimInterface(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("ok", manager.usbClaim(call.getInt("handle", -1), call.getInt("index", 0)));
        call.resolve(ret);
    }

    @PluginMethod
    public void usbTransferOut(PluginCall call) {
        byte[] data = Base64.decode(call.getString("data", ""), Base64.NO_WRAP);
        boolean ok = manager.usbTransferOut(call.getInt("handle", -1), call.getInt("endpoint", 0), data);
        JSObject ret = new JSObject();
        ret.put("ok", ok);
        call.resolve(ret);
    }

    @PluginMethod
    public void usbTransferIn(PluginCall call) {
        byte[] data = manager.usbTransferIn(call.getInt("handle", -1), call.getInt("endpoint", 0), call.getInt("length", 64));
        JSObject ret = new JSObject();
        ret.put("data", Base64.encodeToString(data, Base64.NO_WRAP));
        call.resolve(ret);
    }

    @PluginMethod
    public void usbClose(PluginCall call) {
        manager.usbClose(call.getInt("handle", -1));
        call.resolve();
    }

    // ── HidEvents → JS ──

    @Override public void onReport(String deviceKey, int vendorId, int productId, String dataB64) {
        JSObject o = new JSObject();
        o.put("deviceKey", deviceKey); o.put("vendorId", vendorId);
        o.put("productId", productId); o.put("data", dataB64);
        notifyListeners("report", o);
    }

    @Override public void onDeviceOpened(String deviceKey, int vendorId, int productId, String product) {
        JSObject o = new JSObject();
        o.put("deviceKey", deviceKey);
        o.put("vendorId", String.format(Locale.US, "%04x", vendorId));
        o.put("productId", String.format(Locale.US, "%04x", productId));
        o.put("product", product);
        notifyListeners("deviceOpened", o);
    }

    @Override public void onDisconnect(String deviceKey, String product, String error) {
        JSObject o = new JSObject();
        o.put("deviceKey", deviceKey); o.put("product", product);
        if (error != null) o.put("error", error);
        notifyListeners("disconnect", o);
    }

    @Override public void onError(String deviceKey, String error) {
        JSObject o = new JSObject();
        o.put("deviceKey", deviceKey); o.put("error", error);
        notifyListeners("error", o);
    }

    // ── Helpers ──

    private static byte[] toBytes(JSArray arr) {
        if (arr == null) return new byte[0];
        try {
            byte[] out = new byte[arr.length()];
            for (int i = 0; i < arr.length(); i++) out[i] = (byte) arr.getInt(i);
            return out;
        } catch (org.json.JSONException e) { return new byte[0]; }
    }

    private static String dirOf(UsbEndpoint ep) {
        return ep.getDirection() == UsbConstants.USB_DIR_IN ? "in" : "out";
    }

    private static String typeOf(UsbEndpoint ep) {
        switch (ep.getType()) {
            case UsbConstants.USB_ENDPOINT_XFER_BULK: return "bulk";
            case UsbConstants.USB_ENDPOINT_XFER_INT: return "interrupt";
            case UsbConstants.USB_ENDPOINT_XFER_ISOC: return "isochronous";
            default: return "control";
        }
    }

    private static JSArray describeInterfaces(UsbDevice device) {
        JSArray out = new JSArray();
        if (device == null) return out;
        for (int i = 0; i < device.getInterfaceCount(); i++) {
            UsbInterface iface = device.getInterface(i);
            JSArray endpoints = new JSArray();
            for (int e = 0; e < iface.getEndpointCount(); e++) {
                UsbEndpoint ep = iface.getEndpoint(e);
                JSObject eo = new JSObject();
                eo.put("endpointNumber", ep.getEndpointNumber());
                eo.put("direction", dirOf(ep));
                eo.put("type", typeOf(ep));
                endpoints.put(eo);
            }
            JSObject io = new JSObject();
            io.put("index", i);
            io.put("endpoints", endpoints);
            out.put(io);
        }
        return out;
    }
}
