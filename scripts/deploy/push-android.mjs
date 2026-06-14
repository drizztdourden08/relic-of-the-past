/* @layer tooling-scripts @kind script */
/**
 * Bring up the Android emulator (AVD) and deploy the Capacitor build to it.
 *
 *   npm run emulator:start                 boot the AVD and wait until it's ready
 *   npm run push:android                   ensure an emulator/device is up, then `npm run android:run`
 *   npm run push:android -- --apk <path>   install a prebuilt APK with adb instead
 *
 * The Capacitor deploy (`android:run`) lands once the in-progress mobile project
 * (apps/mobile/) exists; until then this still boots the emulator and tells you so.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { loadConfig } from './config.mjs';
import { log, warn, fail, run, capture, sleep } from './run.mjs';

const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || '';
const ext = process.platform === 'win32' ? '.exe' : '';
const tool = (sub, name) => (sdk ? join(sdk, sub, name + ext) : name + ext);
const adb = tool('platform-tools', 'adb');
const emulatorBin = tool('emulator', 'emulator');

const onlineDevices = () =>
  capture(adb, ['devices'])
    .split('\n')
    .slice(1)
    .filter((line) => line.trim().endsWith('\tdevice'));

const waitForBoot = () => {
  run(adb, ['wait-for-device']);
  for (let i = 0; i < 180; i += 1) {
    try {
      if (capture(adb, ['shell', 'getprop', 'sys.boot_completed']) === '1') return;
    } catch {
      // device not ready to answer yet — keep polling
    }
    sleep(1000);
  }
  fail('Emulator did not finish booting within 3 minutes.');
};

const bootEmulator = (avd) => {
  log(`No device online — booting AVD "${avd}"…`);
  const child = spawn(emulatorBin, ['-avd', avd, '-no-snapshot', '-no-boot-anim'], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
  waitForBoot();
};

const deployCapacitor = () => {
  const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
  if (!pkg.scripts?.['android:run']) {
    warn('No "android:run" script yet — the Capacitor project (apps/mobile/) is still in progress.');
    warn('Emulator is up; once Capacitor lands, `npm run push:android` will deploy automatically.');
    return;
  }
  run('npm', ['run', 'android:run'], { shell: true });
};

const main = () => {
  const config = loadConfig();
  const args = process.argv.slice(2);
  const emulatorOnly = args.includes('--emulator-only');
  const apkIndex = args.indexOf('--apk');
  const apkPath = apkIndex >= 0 ? args[apkIndex + 1] : null;

  try {
    capture(adb, ['version']);
  } catch {
    fail('adb not found. Install Android SDK platform-tools (Stage 5) and set ANDROID_HOME — see scripts/deploy/README.md.');
  }

  if (onlineDevices().length === 0) {
    try {
      bootEmulator(config.avdName);
    } catch {
      fail(`Couldn't boot AVD "${config.avdName}". Create it (Stage 6) or plug in a device with USB debugging.`);
    }
  }
  log('Android device online.');

  if (emulatorOnly) return;
  if (apkPath) {
    if (!existsSync(apkPath)) fail(`APK not found: ${apkPath}`);
    run(adb, ['install', '-r', apkPath]);
    log('APK installed.');
    return;
  }
  deployCapacitor();
};

main();
