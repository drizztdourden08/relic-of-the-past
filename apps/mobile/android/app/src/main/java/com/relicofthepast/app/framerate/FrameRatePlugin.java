package com.relicofthepast.app.framerate;

import android.os.Build;
import android.view.Display;
import android.view.Window;
import android.view.WindowManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Asks Android for a display refresh rate that divides evenly into the game's frame rate.
 *
 * The game advances exactly 60 times a second. On a 90Hz panel that is 1.5 refreshes per
 * frame, so scrolling looks uneven (the same arithmetic that makes 144Hz a problem on desktop).
 *
 * Uses WindowManager.LayoutParams.preferredRefreshRate: Surface.setFrameRate needs a Surface
 * the app owns, and a WebView-hosted Activity has none. preferredDisplayModeId is not used;
 * Android has discouraged it since 11 because it forces a full mode change.
 *
 * Before API 34 the requested value has to be one the display reports, so the rate is chosen
 * from getSupportedRefreshRates(), not passed as a raw 60.
 *
 * NOT VERIFIED ON A DEVICE. Needs a pass on the emulator or hardware.
 */
@CapacitorPlugin(name = "FrameRate")
public class FrameRatePlugin extends Plugin {

    /** Rates within this many Hz of a multiple of 60 count as evenly dividing (59.94 etc). */
    private static final float HZ_TOLERANCE = 1.5f;

    @PluginMethod
    public void setGameFrameRate(PluginCall call) {
        final JSObject result = new JSObject();
        result.put("sdkInt", Build.VERSION.SDK_INT);

        getActivity().runOnUiThread(() -> {
            try {
                apply(result);
            } catch (Throwable t) {
                result.put("applied", false);
                result.put("reason", String.valueOf(t.getMessage()));
            }
            call.resolve(result);
        });
    }

    private void apply(JSObject result) {
        final Window window = getActivity() != null ? getActivity().getWindow() : null;
        if (window == null) {
            result.put("applied", false);
            result.put("reason", "no window");
            return;
        }

        final float target = pickSyncedRate();
        result.put("targetHz", target);
        if (target <= 0) {
            result.put("applied", false);
            result.put("reason", "this display offers no refresh rate that is a multiple of 60");
            return;
        }

        final WindowManager.LayoutParams lp = window.getAttributes();
        lp.preferredRefreshRate = target;
        window.setAttributes(lp);
        // The platform is free to ignore the preference, so this reports what was asked for,
        // never that the display definitely changed.
        result.put("applied", true);
        result.put("reason", "");
    }

    /** Highest supported rate that is a whole multiple of 60, or 0 when there is none. */
    private float pickSyncedRate() {
        final Display display = display();
        if (display == null) return 0f;
        float best = 0f;
        for (float hz : display.getSupportedRefreshRates()) {
            final float multiple = Math.max(1f, Math.round(hz / 60f));
            if (Math.abs(hz - multiple * 60f) > HZ_TOLERANCE) continue;
            if (hz > best) best = hz;
        }
        return best;
    }

    @PluginMethod
    public void getDisplayInfo(PluginCall call) {
        final JSObject result = new JSObject();
        final Display display = display();
        if (display == null) {
            result.put("currentHz", 0);
            result.put("supportedHz", "");
            call.resolve(result);
            return;
        }
        result.put("currentHz", display.getRefreshRate());
        final StringBuilder rates = new StringBuilder();
        final float[] supported = display.getSupportedRefreshRates();
        for (int i = 0; i < supported.length; i++) {
            if (i > 0) rates.append(',');
            rates.append(supported[i]);
        }
        result.put("supportedHz", rates.toString());
        call.resolve(result);
    }

    private Display display() {
        if (getActivity() == null) return null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) return getActivity().getDisplay();
        return getActivity().getWindowManager().getDefaultDisplay();
    }
}
