package com.relicofthepast.app;

import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebView;

import androidx.activity.BackEventCompat;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
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
        }

        // Keep the screen awake while the app is foregrounded — players use a controller
        // and may never touch the screen, so the display would otherwise time out and
        // interrupt the session.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Edge-to-edge + immersive: draw under the status/navigation bars and into the
        // display cutout, so there's no grey system chrome around the app. The WebView's
        // own (black) background fills those regions; the game stays letterboxed in its
        // box, so nothing important lands under the camera notch.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
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
        // returning from the background — otherwise the grey chrome creeps back.
        if (hasFocus) applyImmersive();
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
