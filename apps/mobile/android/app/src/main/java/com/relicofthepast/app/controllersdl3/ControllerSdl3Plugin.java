/*
 * ControllerSdl3Plugin — Capacitor bridge for the SDL3 gamepad backend, the
 * Android counterpart to the desktop Node-API addon (apps/desktop/electron/
 * input/native/sdl3). Forwards each Sdl3Event JSON object (see sdl3.type.ts)
 * from Sdl3Bridge straight to the renderer as a "controllerEvent" notification,
 * carrying its own "type" field ("added"/"removed"/"state") the same way the
 * desktop preload's event callback does — no reshaping in either direction, so
 * a renderer-side consumer only needs one adapter shaped like sdl3.type.ts, not
 * one per platform.
 *
 * NOT yet wired into apps/web/src/platform/hosts/capacitor/controller-host.ts
 * (currently a permanent no-op) — that wiring is a renderer-side change, out of
 * this plugin's scope; see the integration report for what it needs to do.
 *
 * Registered in MainActivity, same as FrameRatePlugin.
 * dispatchKeyEvent()/dispatchGenericMotionEvent() there forward controller
 * button/axis events into Sdl3InputRouter, which this plugin does not touch
 * directly — SDLControllerManager holds that state internally.
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
     * Runs on the UI thread, and so does the polling that follows it. SDL
     * asserts that events are pumped on whichever thread initialised it, and
     * Capacitor dispatches plugin calls on a worker. Starting there while the
     * poll loop ran on the main looper tripped that assertion, whose handler
     * then tried to raise a message box this activity cannot show, taking the
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
            // event came from our own nativePollEvents() JSON writer; a parse
            // failure here means that writer produced malformed JSON, which is
            // a bug in controller_sdl3_jni.c, not a runtime condition to recover from.
        }
    }
}
