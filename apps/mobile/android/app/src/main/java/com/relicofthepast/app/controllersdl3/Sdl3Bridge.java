/*
 * Owns the controllersdl3 native library and the poll loop that drains it.
 * Mirrors the desktop Node-API addon's Sdl3Input surface (apps/desktop/electron/
 * input/native/sdl3/sdl3.type.ts) as closely as JNI allows: nativePollEvents()
 * returns one JSON array per call, in the exact "added"/"removed"/"state" shape
 * of Sdl3Event, so ControllerSdl3Plugin can forward each array element straight
 * to the renderer without reshaping it.
 *
 * SDLControllerManager (org.libsdl.app, see that package's doc comments) needs
 * its native methods registered before nativeStart() touches SDL_Init, and needs
 * pollInputDevices()/handleJoystickMotionEvent() driven from somewhere — the
 * former happens automatically inside SDL's own joystick-detect poll (triggered
 * by nativePollEvents() calling SDL_PollEvent), the latter needs
 * Sdl3InputRouter wired into the hosting Activity's key/motion dispatch.
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

    // Loads the native library the first time any Sdl3Bridge is constructed.
    // Returns false when the .so is missing (wrong ABI, or not built at all) —
    // callers should report "no controller support" rather than crash, the same
    // way a desktop build with no SDL3 addon reports it.
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
        // Must come after initialize(), which sets the context back to null.
        // SDL's own Java layer calls into this activity while it brings the
        // joystick backend up, and reaches it through a JNI global that is
        // otherwise null, which aborts the process rather than failing.
        org.libsdl.app.SDL.setContext(activity);
        // SDL's own USB HID layer is deliberately NOT started here. Every
        // controller on this platform is already delivered by the system as an
        // input device, and SDL reads those directly, so the HID layer adds
        // nothing that path does not already provide. What it does add is harm:
        // it asks the user for USB permission per device, and opening a device
        // force-claims its interface, which detaches the very driver that was
        // presenting the pad, so accepting that prompt makes a working
        // controller disappear. Leaving it unstarted keeps every pad on one
        // path, with no prompts.
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
