package com.relicofthepast.app;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Build;
import android.os.Bundle;
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
import com.relicofthepast.app.controllerhid.ControllerHidPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ControllerHidPlugin.class);
        super.onCreate(savedInstanceState);

        // Let the game's audio (Web Audio / SDL2) start without an explicit tap. The
        // WebView otherwise gates all playback behind a user gesture, and players use a
        // controller — they may never touch the screen, so the AudioContext would stay
        // suspended and the game would be silent.
        final WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
            // Black, not the default grey, so the area behind the WebView (display
            // cutout, transiently-shown bars) matches the app's black background.
            webView.setBackgroundColor(Color.BLACK);
        }

        // Paint the window itself black and make the system bars transparent, so the
        // notch/cutout and bar regions read as pure black instead of system grey.
        getWindow().setBackgroundDrawable(new ColorDrawable(Color.BLACK));
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        // Keep the screen awake while the app is foregrounded — players use a controller
        // and may never touch the screen, so the display would otherwise time out and
        // interrupt the session.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Edge-to-edge + immersive: draw under the status/navigation bars and into the
        // display cutout, so there's no grey system chrome around the app. The WebView's
        // own (black) background fills those regions; the game stays letterboxed in its
        // box, so nothing important lands under the camera notch.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        // Consume all window insets so Capacitor's WebView fills the entire screen
        // (including the display cutout) instead of being padded into the safe area —
        // without this the content sits off-center next to the camera notch. We first
        // forward the cutout insets to the web as CSS vars (--sai-*), since consuming
        // them zeroes the page's env(safe-area-inset-*).
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

        // Take over Back and route it per swipe edge using predictive back's swipe edge
        // (reliable across the full edge). The JS chrome decides: left = home/close,
        // right = options menu. Added after super.onCreate so it sits above Capacitor's
        // own callback (the dispatcher is LIFO).
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
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // Re-hide the bars after they're transiently revealed by a swipe or after
        // returning from the background — otherwise the grey chrome creeps back. Also
        // re-dispatch insets so the web gets the cutout sizes once its DOM is ready.
        if (hasFocus) {
            applyImmersive();
            ViewCompat.requestApplyInsets(getWindow().getDecorView());
        }
    }

    // Forward the display-cutout insets to the web as CSS px custom properties on
    // <html> (--sai-top/right/bottom/left). We consume insets for full-bleed, which
    // zeroes env(safe-area-inset-*), so the renderer reads these instead.
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
