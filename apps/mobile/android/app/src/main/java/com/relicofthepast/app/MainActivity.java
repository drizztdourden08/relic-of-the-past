package com.relicofthepast.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.relicofthepast.app.controllerhid.ControllerHidPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ControllerHidPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
