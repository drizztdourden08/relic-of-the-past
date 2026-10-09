package com.relicofthepast.app;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Build;
import android.os.Bundle;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.WindowManager;
import android.webkit.WebView;

import androidx.activity.BackEventCompat;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;
import com.relicofthepast.app.controllersdl3.ControllerSdl3Plugin;
import com.relicofthepast.app.controllersdl3.Sdl3InputRouter;
import com.relicofthepast.app.framerate.FrameRatePlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ControllerSdl3Plugin.class);
        registerPlugin(FrameRatePlugin.class);
        super.onCreate(savedInstanceState);

        // Players use a controller and may never tap the screen, so the WebView must
        // not gate audio behind a user gesture or the AudioContext stays suspended.
        final WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
            // Black, not the default grey, behind the WebView (cutout, transient bars).
            webView.setBackgroundColor(Color.BLACK);
        }

        // Window black and system bars transparent, so the cutout and bar regions
        // read as pure black instead of system grey.
        getWindow().setBackgroundDrawable(new ColorDrawable(Color.BLACK));
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        // Controller players may never touch the screen, so it must not time out.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Edge-to-edge + immersive: draw under the bars and into the cutout. The game
        // stays letterboxed, so nothing important lands under the camera notch.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        // Consume all insets so the WebView fills the screen including the cutout;
        // otherwise the content sits off-center next to the notch. Consuming zeroes
        // env(safe-area-inset-*), so the cutout insets go to the web as --sai-* first.
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (v, insets) -> {
            injectSafeAreaInsets(insets);
            return WindowInsetsCompat.CONSUMED;
        });
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
                ? WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
                : WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }
        applyImmersive();

        // Route Back per predictive-back swipe edge; the JS chrome decides (left =
        // home/close, right = options menu). Added after super.onCreate so it sits
        // above Capacitor's own callback (the dispatcher is LIFO).
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            private String edge = "right"; // button-press / non-gesture default

            @Override
            public void handleOnBackStarted(@NonNull BackEventCompat event) {
                edge = event.getSwipeEdge() == BackEventCompat.EDGE_LEFT ? "left" : "right";
            }

            @Override
            public void handleOnBackPressed() {
                emitBack(edge);
                edge = "right";
            }
        });
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        // Controller presses go to the SDL3 backend before anything else sees them
        // (a WebView OnKeyListener would otherwise consume a BACK/START code first).
        if (Sdl3InputRouter.handleKeyEvent(event)) {
            return true;
        }
        return super.dispatchKeyEvent(event);
    }

    @Override
    public boolean dispatchGenericMotionEvent(MotionEvent event) {
        if ((event.getSource() & InputDevice.SOURCE_CLASS_JOYSTICK) != 0
                && Sdl3InputRouter.handleGenericMotionEvent(event)) {
            return true;
        }
        return super.dispatchGenericMotionEvent(event);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // Re-hide the bars after a swipe reveal or a return from the background, and
        // re-dispatch insets so the web gets the cutout sizes once its DOM is ready.
        if (hasFocus) {
            applyImmersive();
            ViewCompat.requestApplyInsets(getWindow().getDecorView());
        }
    }

    // Cutout insets as CSS px custom properties on <html> (--sai-top/right/bottom/left),
    // since consuming insets for full-bleed zeroes env(safe-area-inset-*).
    private void injectSafeAreaInsets(WindowInsetsCompat insets) {
        if (getBridge() == null) return;
        final WebView webView = getBridge().getWebView();
        if (webView == null) return;
        final Insets cut = insets.getInsets(WindowInsetsCompat.Type.displayCutout());
        float d = getResources().getDisplayMetrics().density;
        if (d <= 0) d = 1;
        final String js = "(function(){var s=document.documentElement.style;"
            + "s.setProperty('--sai-left','" + (cut.left / d) + "px');"
            + "s.setProperty('--sai-top','" + (cut.top / d) + "px');"
            + "s.setProperty('--sai-right','" + (cut.right / d) + "px');"
            + "s.setProperty('--sai-bottom','" + (cut.bottom / d) + "px');"
            + "window.dispatchEvent(new Event('rotpinsets'));})();";
        webView.evaluateJavascript(js, null);
    }

    private void applyImmersive() {
        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.hide(WindowInsetsCompat.Type.systemBars());
        controller.setSystemBarsBehavior(
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }

    private void emitBack(String edge) {
        if (getBridge() == null) return;
        final WebView webView = getBridge().getWebView();
        if (webView == null) return;
        webView.evaluateJavascript(
            "window.dispatchEvent(new CustomEvent('rotpback',{detail:'" + edge + "'}))", null);
    }
}
