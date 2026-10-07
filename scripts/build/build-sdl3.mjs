/* @layer tooling-scripts @kind logic */
/**
 * Build SDL3 from the source fetched by fetch-sdl3.mjs with SDL_HIDAPI_LIBUSB=ON
 * and install it under third_party/sdl3/install/<platform>-<arch>/ (gitignored).
 * From source because the official prebuilt (SDL3-devel-*-VC.zip) is compiled
 * without libusb, so no consuming flag can make it Switch 2-capable; the native
 * addon's CMake points SDL3_DIR at our install, never at the devel package.
 *
 * Versions are pinned in apps/desktop/electron/input/native/sdl3/package.json.
 * Idempotent via a marker keyed on sdl3Version+libusbVersion+platform+arch;
 * --force redoes it. Needs a C/C++ toolchain + CMake on PATH; scripts/ensure-sdl3.mjs
 * only falls back to this when no matching prebuilt addon package exists.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, realpathSync, rmSync, chmodSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..', '..');
const pinnedPkgPath = join(repoRoot, 'apps/desktop/electron/input/native/sdl3/package.json');
const thirdPartyDir = join(repoRoot, 'third_party/sdl3');
const force = process.argv.includes('--force');

// CMake's -A platform name and the libusb prebuilt subfolder under libusb-<version>/.
// Windows only; Linux/macOS resolve libusb via pkg-config.
const WIN_ARCH = { x64: { cmakePlatform: 'x64', libusbDir: 'VS2022/MS64' }, ia32: { cmakePlatform: 'Win32', libusbDir: 'VS2022/MS32' }, arm64: { cmakePlatform: 'ARM64', libusbDir: 'VS2025/ARM64' } };

const readPinnedVersions = () => {
  const pkg = JSON.parse(readFileSync(pinnedPkgPath, 'utf8'));
  if (!pkg.sdl3 || !pkg.libusb) {
    console.error(`[build-sdl3] ${pinnedPkgPath} must declare top-level "sdl3" and "libusb" version fields.`);
    process.exit(1);
  }
  return { sdl3Version: pkg.sdl3, libusbVersion: pkg.libusb };
};

const readMarker = (markerPath) => {
  if (!existsSync(markerPath)) return null;
  try {
    return JSON.parse(readFileSync(markerPath, 'utf8'));
  } catch {
    return null;
  }
};

// SDL installs its CMake package config where each platform expects it: right
// under the prefix on Windows, and under lib/cmake following the GNU layout
// elsewhere. Both are looked at so no caller needs a per-platform special case.
const sdl3ConfigDir = (installDir) => {
  const candidates = [
    join(installDir, 'cmake'),
    join(installDir, 'lib', 'cmake', 'SDL3'),
    join(installDir, 'lib64', 'cmake', 'SDL3'),
  ];
  return candidates.find((dir) => existsSync(join(dir, 'SDL3Config.cmake'))) ?? null;
};

const isUpToDate = (markerPath, pinned, installDir) => {
  const marker = readMarker(markerPath);
  if (!marker) return false;
  return (
    marker.sdl3Version === pinned.sdl3Version &&
    marker.libusbVersion === pinned.libusbVersion &&
    marker.platform === process.platform &&
    marker.arch === process.arch &&
    marker.hidapiLibusb === true &&
    sdl3ConfigDir(installDir) !== null
  );
};

const runCmake = (args, cwd) => {
  console.log(`[build-sdl3] cmake ${args.join(' ')}`);
  execFileSync('cmake', args, { cwd, stdio: 'inherit' });
};

// Configures + builds + installs SDL3 with libusb on for the given source and
// libusb dirs, returning the extra -D args needed for SDL_HIDAPI_LIBUSB.
const configureArgs = (sourceDir, buildDir, installDir, libusbVersion) => {
  const args = ['-S', sourceDir, '-B', buildDir, '-DCMAKE_BUILD_TYPE=Release', '-DSDL_SHARED=ON', '-DSDL_STATIC=OFF', '-DSDL_HIDAPI_LIBUSB=ON', `-DCMAKE_INSTALL_PREFIX=${installDir}`];
  if (process.platform === 'linux') {
    // The addon never opens a window, so skip SDL's X11/Wayland header check (it
    // fails on minimal build machines) and keep display-server deps out of the
    // shipped library.
    args.push('-DSDL_UNIX_CONSOLE_BUILD=ON');
  }
  if (process.platform === 'win32') {
    const arch = WIN_ARCH[process.arch];
    if (!arch) {
      console.error(`[build-sdl3] Unsupported Windows arch: ${process.arch}`);
      process.exit(1);
    }
    const libusbDir = join(thirdPartyDir, `libusb-${libusbVersion}`);
    args.push('-A', arch.cmakePlatform, `-DLibUSB_INCLUDE_PATH=${join(libusbDir, 'include')}`, `-DLibUSB_LIBRARY=${join(libusbDir, arch.libusbDir, 'dll', 'libusb-1.0.lib')}`);
  }
  return args;
};

// SDL builds with SDL_HIDAPI_LIBUSB_SHARED=ON and dlopen()s libusb at runtime under
// the bare name baked in at its build time, so the file must ship under exactly
// this name per platform.
const LIBUSB_RUNTIME_NAME = { linux: 'libusb-1.0.so.0', darwin: 'libusb-1.0.0.dylib' };

// libusb ships beside the addon on every platform so a player never needs it
// system-wide. Windows takes it from the upstream archive; Linux and macOS copy
// the system library SDL was just built against, located through pkg-config.
const copyLibusbRuntime = (installDir, libusbVersion) => {
  if (process.platform === 'win32') {
    const arch = WIN_ARCH[process.arch];
    const src = join(thirdPartyDir, `libusb-${libusbVersion}`, arch.libusbDir, 'dll', 'libusb-1.0.dll');
    const destDir = join(installDir, 'bin');
    mkdirSync(destDir, { recursive: true });
    copyFileSync(src, join(destDir, 'libusb-1.0.dll'));
    console.log(`[build-sdl3] Copied libusb-1.0.dll -> ${destDir}`);
    return;
  }

  const name = LIBUSB_RUNTIME_NAME[process.platform];
  if (!name) return;
  let libdir;
  try {
    libdir = execFileSync('pkg-config', ['--variable=libdir', 'libusb-1.0'], { encoding: 'utf8' }).trim();
  } catch {
    console.warn('[build-sdl3] pkg-config could not locate libusb-1.0, so it will not ship beside the addon. Controllers needing it will only work where it is installed system-wide.');
    return;
  }
  // The versioned name is usually a symlink; the real file is copied under the name SDL asks for.
  const src = join(libdir, name);
  if (!existsSync(src)) {
    console.warn(`[build-sdl3] ${src} not found, so libusb will not ship beside the addon.`);
    return;
  }
  const destDir = join(installDir, 'lib');
  mkdirSync(destDir, { recursive: true });
  const dest = join(destDir, name);
  // The package manager's copy is read-only and copyFileSync carries the mode
  // across, so a second copy over it fails with EACCES without this.
  rmSync(dest, { force: true });
  copyFileSync(realpathSync(src), dest);
  chmodSync(dest, 0o644);
  console.log(`[build-sdl3] Copied ${name} -> ${destDir}`);
};

const writeMarker = (markerPath, pinned) => {
  mkdirSync(resolve(markerPath, '..'), { recursive: true });
  writeFileSync(markerPath, JSON.stringify({ ...pinned, platform: process.platform, arch: process.arch, hidapiLibusb: true, builtAt: new Date().toISOString() }, null, 2));
};

const main = () => {
  const pinned = readPinnedVersions();
  const sourceDir = join(thirdPartyDir, `SDL3-${pinned.sdl3Version}`);
  const buildDir = join(thirdPartyDir, `build-${process.platform}-${process.arch}`);
  const installDir = join(thirdPartyDir, 'install', `${process.platform}-${process.arch}`);
  const markerPath = join(thirdPartyDir, 'install', `.built-${process.platform}-${process.arch}.json`);

  if (!force && isUpToDate(markerPath, pinned, installDir)) {
    console.log(`[build-sdl3] Up to date (sdl3 ${pinned.sdl3Version}, libusb, ${process.platform}-${process.arch}). Pass --force to redo it.`);
    return;
  }

  if (!existsSync(sourceDir)) {
    console.log(`[build-sdl3] SDL3 source not found at ${sourceDir}. Fetching it first.`);
    execFileSync('node', [join(repoRoot, 'scripts/build/fetch-sdl3.mjs')], { stdio: 'inherit' });
  }
  if (!existsSync(sourceDir)) {
    console.error(`[build-sdl3] SDL3 source still missing at ${sourceDir} after fetch-sdl3.mjs. See its output above.`);
    process.exit(1);
  }

  console.log(`[build-sdl3] Building sdl3 ${pinned.sdl3Version} from source with SDL_HIDAPI_LIBUSB=ON for ${process.platform}-${process.arch}...`);
  try {
    mkdirSync(buildDir, { recursive: true });
    runCmake(configureArgs(sourceDir, buildDir, installDir, pinned.libusbVersion), repoRoot);
    runCmake(['--build', buildDir, '--config', 'Release', '--parallel'], repoRoot);
    runCmake(['--install', buildDir, '--config', 'Release'], repoRoot);
    copyLibusbRuntime(installDir, pinned.libusbVersion);
  } catch (err) {
    console.error(`[build-sdl3] Build failed: ${err.message}`);
    console.error('[build-sdl3] This step needs CMake and a C/C++ toolchain (MSVC on Windows, gcc/clang elsewhere) on PATH.');
    process.exit(1);
  }

  if (!sdl3ConfigDir(installDir)) {
    console.error(`[build-sdl3] Build finished but no SDL3Config.cmake was installed under ${installDir}. The install step may have failed silently.`);
    process.exit(1);
  }
  writeMarker(markerPath, pinned);
  console.log(`[build-sdl3] Done. SDL3 (with libusb) installed at ${installDir}`);
};

main();
