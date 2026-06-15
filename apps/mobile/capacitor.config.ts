/* @layer root-config @kind config */
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.relicofthepast.app',
  appName: 'Relic of the Past',
  // Relative to this config's location → repo-root/dist/web (built by `npm run build:web`).
  webDir: '../../dist/web',
  android: {
    // Default androidScheme 'https' keeps window.location.protocol === 'https:',
    // so instantiate-wasm.ts loads the core via fetch (no readWasmBytes IPC needed).
    allowMixedContent: false,
  },
};

export default config;
