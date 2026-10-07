/*
 * Capacitor bridge for the SDL3 gamepad backend, the Android counterpart to
 * the desktop addon (apps/desktop/electron/input/native/sdl3). Forwards each
 * Sdl3Event JSON object (see sdl3.type.ts) from Sdl3Bridge to the renderer as
 * a "controllerEvent" notification with no reshaping, so a renderer consumer
 * needs one adapter shaped like sdl3.type.ts, not one per platform.
 *
 * NOT yet wired into apps/web/src/platform/hosts/capacitor/controller-host.ts
 * (currently a permanent no-op); that is a renderer-side change.
 *
 * Registered in MainActivity, whose dispatchKeyEvent()/dispatchGenericMotionEvent()
 * forward controller events into Sdl3InputRouter. This plugin does not touch
 * that state; SDLControllerManager holds it internally.
 */
package com.relicofthepast.app.controllersdl3;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

@CapacitorPlugin(name = "ControllerSdl3")
public class ControllerSdl3Plugin extends Plugin implements Sdl3Bridge.Listener {

    private Sdl3Bridge bridge;

    @Override
    public void load() {
        bridge = new Sdl3Bridge(this);
    }

    @Override
    protected void handleOnDestroy() {
        bridge.stop();
    }

    /**
     * UI thread, like the polling that follows. SDL asserts events are pumped on
     * the thread that initialised it; starting on Capacitor's worker thread tripped
     * that assertion, whose handler tried to raise a message box and took the
     * process down.
     */
    @PluginMethod
    public void start(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            JSObject ret = new JSObject();
            ret.put("ok", bridge.start(getActivity()));
            call.resolve(ret);
        });
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getActivity().runOnUiThread(bridge::stop);
        call.resolve();
    }

    @PluginMethod
    public void rumble(PluginCall call) {
        int id = call.getInt("id", -1);
        double low = call.getDouble("low", 0.0);
        double high = call.getDouble("high", 0.0);
        int durationMs = call.getInt("durationMs", 0);
        JSObject ret = new JSObject();
        ret.put("ok", bridge.rumble(id, (float) low, (float) high, durationMs));
        call.resolve(ret);
    }

    @Override
    public void onControllerEvent(JSONObject event) {
        try {
            notifyListeners("controllerEvent", new JSObject(event.toString()));
        } catch (JSONException e) {
            // A parse failure is a bug in controller_sdl3_jni.c's JSON writer,
            // not a runtime condition to recover from.
        }
    }
}
