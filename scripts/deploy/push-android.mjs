/* @layer tooling-scripts @kind script */
/**
 * Bring up the Android emulator and deploy the Capacitor build to it.
 *
 *   npm run emulator:start                 boot the AVD and wait until it's ready
 *   npm run push:android                   build + install + launch on the emulator/device
 *   npm run push:android -- --apk <path>   install a prebuilt APK instead
 */
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { loadConfig } from './config.mjs';
import { log, warn, fail, run, capture, sleep } from './run.mjs';

const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || '';
const ext = process.platform === 'win32' ? '.exe' : '';
const tool = (sub, name) => (sdk ? join(sdk, sub, name + ext) : name + ext);
const adb = tool('platform-tools', 'adb');
const emulatorBin = tool('emulator', 'emulator');
const APP_ID = 'com.relicofthepast.app';

const onlineDevices = () =>
  capture(adb, ['devices'])
    .split('\n')
    .slice(1)
    .filter((line) => line.trim().endsWith('\tdevice'));

const deviceSerial = () => {
  const line = onlineDevices()[0];
  return line ? line.split(/\s+/)[0] : null;
};

const waitForBoot = () => {
  run(adb, ['wait-for-device']);
  for (let i = 0; i < 180; i += 1) {
    try {
      if (capture(adb, ['shell', 'getprop', 'sys.boot_completed']) === '1') return;
    } catch {
      // device not answering yet — keep polling
    }
    sleep(1000);
  }
  fail('Emulator did not finish booting within 3 minutes.');
};

const bootEmulator = (avd) => {
  log(`Booting AVD "${avd}"…`);
  const child = spawn(emulatorBin, ['-avd', avd, '-no-snapshot', '-no-boot-anim'], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
  waitForBoot();
};

// Copy the local ./test-roms folder to /sdcard/Download on the device.
const pushRoms = (serial) => {
  const local = join(process.cwd(), 'test-roms');
  mkdirSync(local, { recursive: true });
  if (readdirSync(local).length === 0) {
    warn(`${local} is empty — add ROMs there to push them to the device.`);
    return;
  }
  log('Pushing test-roms -> /sdcard/Download/test-roms…');
  run(adb, ['-s', serial, 'push', local, '/sdcard/Download/']);
  // Register the files in MediaStore so they appear in the file picker.
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

// Build the debug APK with the Gradle wrapper, then install + launch it via adb.
const deployCapacitor = (serial) => {
  const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
  if (!pkg.scripts?.['cap:sync']) {
    fail('No "cap:sync" script — set up the Capacitor project. See docs/contributing/testing-linux-and-android.md.');
  }
  run('npm', ['run', 'cap:sync'], { shell: true });
  const android = join(process.cwd(), 'apps', 'mobile', 'android');
  const gradlew = join(android, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
  log('Building debug APK…');
  run(gradlew, ['assembleDebug'], { cwd: android, shell: true });
  const apk = join(android, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  log(`Installing + launching on ${serial}…`);
  run(adb, ['-s', serial, 'install', '-r', apk]);
  run(adb, ['-s', serial, 'shell', 'monkey', '-p', APP_ID, '-c', 'android.intent.category.LAUNCHER', '1'], {
    stdio: 'ignore',
  });
  log('Installed and launched on the emulator.');
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
    fail('adb not found. Install the Android SDK + set ANDROID_HOME — see docs/contributing/testing-linux-and-android.md.');
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
