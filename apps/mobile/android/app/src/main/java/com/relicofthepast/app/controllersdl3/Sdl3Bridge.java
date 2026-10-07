/*
 * Owns the controllersdl3 native library and the poll loop that drains it.
 * Mirrors the desktop addon's Sdl3Input surface (apps/desktop/electron/input/
 * native/sdl3/sdl3.type.ts): nativePollEvents() returns one JSON array per call
 * in the exact Sdl3Event shape, so ControllerSdl3Plugin forwards each element
 * to the renderer unchanged.
 *
 * SDLControllerManager (org.libsdl.app) needs its native methods registered
 * before nativeStart() touches SDL_Init. pollInputDevices() runs inside SDL's
 * own joystick-detect poll (via SDL_PollEvent); handleJoystickMotionEvent()
 * needs Sdl3InputRouter wired into the Activity's key/motion dispatch.
 */
package com.relicofthepast.app.controllersdl3;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Sdl3Bridge {
    private static final String TAG = "Sdl3Bridge";
    private static final long POLL_INTERVAL_MS = 16; // ~60Hz, matching the desktop addon's cadence.

    public interface Listener {
        void onControllerEvent(JSONObject event);
    }

    private static boolean sLibraryLoaded;
    private static boolean sLibraryLoadAttempted;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Listener listener;
    private boolean running;

    private final Runnable pollTask = new Runnable() {
        @Override
        public void run() {
            if (!running) return;
            pollOnce();
            handler.postDelayed(this, POLL_INTERVAL_MS);
        }
    };

    public Sdl3Bridge(Listener listener) {
        this.listener = listener;
    }

    // False when the .so is missing (wrong ABI, or not built): callers report
    // "no controller support" instead of crashing, like the desktop addon.
    public static synchronized boolean ensureLibraryLoaded() {
        if (sLibraryLoadAttempted) return sLibraryLoaded;
        sLibraryLoadAttempted = true;
        try {
            System.loadLibrary("controllersdl3");
            sLibraryLoaded = true;
        } catch (UnsatisfiedLinkError e) {
            Log.w(TAG, "controllersdl3 native library not available: " + e.getMessage());
            sLibraryLoaded = false;
        }
        return sLibraryLoaded;
    }

    public boolean start(android.app.Activity activity) {
        if (!ensureLibraryLoaded()) return false;
        if (running) return true;
        org.libsdl.app.SDL.setupJNI();
        org.libsdl.app.SDL.initialize();
        // Must come after initialize(), which nulls the context. SDL's Java
        // layer reaches this activity through a JNI global while bringing the
        // joystick backend up; null there aborts the process.
        org.libsdl.app.SDL.setContext(activity);
        // SDL's USB HID layer is deliberately NOT started. The system already
        // delivers every controller as an input device SDL reads directly. The
        // HID layer would prompt for USB permission per device, and opening one
        // force-claims its interface and detaches the driver presenting the pad,
        // so accepting the prompt makes a working controller disappear.
        if (!nativeStart()) {
            Log.e(TAG, "SDL_Init(SDL_INIT_GAMEPAD) failed");
            return false;
        }
        running = true;
        handler.post(pollTask);
        return true;
    }

    public void stop() {
        if (!running) return;
        running = false;
        handler.removeCallbacks(pollTask);
        nativeStop();
    }

    public boolean rumble(int id, float low, float high, int durationMs) {
        if (!running) return false;
        return nativeRumble(id, low, high, durationMs);
    }

    private void pollOnce() {
        String json = nativePollEvents();
        if (json == null || json.equals("[]")) return;
        try {
            JSONArray events = new JSONArray(json);
            for (int i = 0; i < events.length(); i++) {
                listener.onControllerEvent(events.getJSONObject(i));
            }
        } catch (JSONException e) {
            Log.e(TAG, "Malformed event batch from nativePollEvents(): " + e.getMessage());
        }
    }

    private static native boolean nativeStart();
    private static native void nativeStop();
    private static native String nativePollEvents();
    private static native boolean nativeRumble(int id, float low, float high, int durationMs);
    static native String nativeVersion();
}
