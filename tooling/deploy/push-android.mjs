/* @layer tooling-scripts @kind script */
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { loadConfig } from './config.mjs';
import { log, warn, fail, run, capture, captureOrNull, sleep } from './run.mjs';

const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || '';
const ext = process.platform === 'win32' ? '.exe' : '';
const tool = (sub, name) => (sdk ? join(sdk, sub, name + ext) : name + ext);
const adb = tool('platform-tools', 'adb');
const emulatorBin = tool('emulator', 'emulator');
const APP_ID = 'com.relicofthepast.app';
const DEBUG_APP_ID = `${APP_ID}.debug`;

const onlineDevices = () =>
  capture(adb, ['devices'])
    .split('\n')
    .slice(1)
    .filter((line) => line.trim().endsWith('\tdevice'));

const deviceSerial = () => {
  const online = onlineDevices().map((line) => line.split(/\s+/)[0]);
  const preferred = process.env.ANDROID_SERIAL;
  if (preferred && online.includes(preferred)) return preferred;
  return online[0] ?? null;
};

const waitForBoot = () => {
  run(adb, ['wait-for-device']);
  for (let i = 0; i < 180; i += 1) {
    if (captureOrNull(adb, ['shell', 'getprop', 'sys.boot_completed']) === '1') return;
    sleep(1000);
  }
  fail('Emulator did not finish booting within 3 minutes.');
};

const bootEmulator = (avd) => {
  log(`Booting AVD "${avd}"...`);
  const child = spawn(emulatorBin, ['-avd', avd, '-no-snapshot', '-no-boot-anim'], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
  waitForBoot();
};

const pushRoms = (serial) => {
  const local = join(process.cwd(), 'test-roms');
  mkdirSync(local, { recursive: true });
  if (readdirSync(local).length === 0) {
    warn(`No ROMs in ${local}. Add some there to push them to the device.`);
    return;
  }
  log('Pushing test-roms -> /sdcard/Download/test-roms...');
  run(adb, ['-s', serial, 'push', local, '/sdcard/Download/']);
  run(
    adb,
    [
      '-s',
      serial,
      'shell',
      'for f in /sdcard/Download/test-roms/*; do am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d "file://$f"; done',
    ],
    { stdio: 'ignore' },
  );
};

const deployCapacitor = (serial) => {
  const android = join(process.cwd(), 'apps', 'desktop', 'mobile', 'android');
  if (!existsSync(android)) {
    fail('No Android project at apps/desktop/mobile/android. See docs/contributing/testing-linux-and-android.md.');
  }
  log('Building debug APK...');
  run('pnpm', ['--dir', 'apps/desktop', 'exec', 'brock', 'mobile', 'build'], { shell: true });
  const apk = join(android, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  log(`Installing + launching on ${serial}...`);
  run(adb, ['-s', serial, 'install', '-r', apk]);
  run(adb, ['-s', serial, 'shell', 'am', 'force-stop', DEBUG_APP_ID], { stdio: 'ignore' });
  run(adb, ['-s', serial, 'shell', 'monkey', '-p', DEBUG_APP_ID, '-c', 'android.intent.category.LAUNCHER', '1'], {
    stdio: 'ignore',
  });
  log(`Installed and launched on ${serial}.`);
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
    fail('adb not found. Install the Android SDK and set ANDROID_HOME. See docs/contributing/testing-linux-and-android.md.');
  }

  if (onlineDevices().length === 0) {
    try {
      bootEmulator(config.avdName);
    } catch {
      fail(`Couldn't boot AVD "${config.avdName}". Create it or plug in a device with USB debugging.`);
    }
  }
  log('Android device online.');

  if (emulatorOnly) return;
  const serial = deviceSerial();
  pushRoms(serial);
  if (apkPath) {
    if (!existsSync(apkPath)) fail(`APK not found: ${apkPath}`);
    run(adb, ['-s', serial, 'install', '-r', apkPath]);
    log('APK installed.');
    return;
  }
  deployCapacitor(serial);
};

main();
