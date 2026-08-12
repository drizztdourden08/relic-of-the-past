/*
 * Forwards controller key/motion events from MainActivity into
 * org.libsdl.app.SDLControllerManager. This is the piece SDLActivity would
 * normally own (see its dispatchKeyEvent/onKey and SDLGenericMotionListener in
 * the real SDL3 android-project) — this app never runs SDLActivity itself, so
 * MainActivity calls these two methods directly from its own
 * dispatchKeyEvent()/dispatchGenericMotionEvent() overrides instead.
 *
 * Hotplug (added/removed) does NOT go through here — that is driven entirely by
 * SDL's own periodic InputDevice enumeration inside nativePollEvents(). Only
 * live button/axis state needs this routing.
 */
package com.relicofthepast.app.controllersdl3;

import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.MotionEvent;

import org.libsdl.app.SDLControllerManager;

public class Sdl3InputRouter {

    // Returns true when the event was a controller button and was consumed.
    public static boolean handleKeyEvent(KeyEvent event) {
        int deviceId = event.getDeviceId();
        if (!SDLControllerManager.isDeviceSDLJoystick(deviceId)) {
            return false;
        }
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            return SDLControllerManager.onNativePadDown(deviceId, event.getKeyCode(), event.getScanCode());
        }
        if (event.getAction() == KeyEvent.ACTION_UP) {
            return SDLControllerManager.onNativePadUp(deviceId, event.getKeyCode(), event.getScanCode());
        }
        return false;
    }

    // Returns true when the event was joystick axis motion and was consumed.
    public static boolean handleGenericMotionEvent(MotionEvent event) {
        if ((event.getSource() & InputDevice.SOURCE_CLASS_JOYSTICK) == 0) {
            return false;
        }
        return SDLControllerManager.handleJoystickMotionEvent(event);
    }
}
