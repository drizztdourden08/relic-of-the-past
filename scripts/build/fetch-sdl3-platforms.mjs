/* @layer tooling-scripts @kind logic */
/**
 * Per-platform fetch strategies for scripts/build/fetch-sdl3.mjs, split out to
 * keep that file under the repo's line limit. Each function takes the pinned
 * versions, a `fetchAndVerify(url, filename)` downloader already wired to the
 * checksums map and the shared downloads dir, and the third_party/sdl3
 * extraction root — and returns the artifact paths to record in the marker
 * (a literal `'system'` entry means "satisfied by a system package, nothing
 * on disk to check next time").
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { extractTarGz, extractSevenZipBestEffort, commandSucceeds } from './fetch-sdl3-helpers.mjs';

const fetchWindows = async ({ sdl3Version, libusbVersion }, fetchAndVerify, thirdPartyDir) => {
  const artifacts = [];

  // Windows fetches SDL3 SOURCE, same as Linux/macOS, never the official
  // SDL3-devel-*-VC.zip: that prebuilt is compiled without libusb, so its
  // SDL3Config.cmake can never resolve a Switch 2-capable DLL no matter what
  // a consumer passes — see scripts/build/build-sdl3.mjs, which builds this
  // source tree itself with SDL_HIDAPI_LIBUSB=ON.
  const tarball = await fetchAndVerify(
    `https://github.com/libsdl-org/SDL/releases/download/release-${sdl3Version}/SDL3-${sdl3Version}.tar.gz`,
    `SDL3-${sdl3Version}.tar.gz`,
  );
  const sourceDir = join(thirdPartyDir, `SDL3-${sdl3Version}`);
  extractTarGz(tarball, thirdPartyDir);
  if (!existsSync(join(sourceDir, 'CMakeLists.txt'))) throw new Error(`Expected ${sourceDir}/CMakeLists.txt after extracting SDL3 source — the tarball layout may have changed.`);
  artifacts.push(sourceDir);
  console.log(`[fetch-sdl3] SDL3 source ready at ${sourceDir} — build it with \`npm run ensure-sdl3\` (or scripts/build/build-sdl3.mjs directly).`);

  // libusb's Windows releases are published upstream as a bare .7z, as-is,
  // with no separate checksum file of their own.
  const libusbArchive = await fetchAndVerify(
    `https://github.com/libusb/libusb/releases/download/v${libusbVersion}/libusb-${libusbVersion}.7z`,
    `libusb-${libusbVersion}.7z`,
  );
  const libusbDir = join(thirdPartyDir, `libusb-${libusbVersion}`);
  if (extractSevenZipBestEffort(libusbArchive, libusbDir)) {
    artifacts.push(libusbDir);
    console.log(`[fetch-sdl3] libusb ready under ${libusbDir}`);
  } else {
    console.warn(
      `[fetch-sdl3] Could not auto-extract ${libusbArchive} (no 7z-capable tar on this system).\n` +
        '[fetch-sdl3] Install 7-Zip (https://www.7-zip.org/) and run:\n' +
        `[fetch-sdl3]   "C:\\Program Files\\7-Zip\\7z.exe" x "${libusbArchive}" -o"${libusbDir}"`,
    );
    artifacts.push(libusbArchive);
  }
  return artifacts;
};

const fetchLinux = async ({ sdl3Version }, fetchAndVerify, thirdPartyDir) => {
  const artifacts = [];
  if (commandSucceeds('pkg-config', ['--exists', 'sdl3'])) {
    console.log('[fetch-sdl3] Found system libsdl3-dev via pkg-config — using it, skipping download.');
    artifacts.push('system');
  } else {
    const tarball = await fetchAndVerify(
      `https://github.com/libsdl-org/SDL/releases/download/release-${sdl3Version}/SDL3-${sdl3Version}.tar.gz`,
      `SDL3-${sdl3Version}.tar.gz`,
    );
    const sourceDir = join(thirdPartyDir, `SDL3-${sdl3Version}`);
    extractTarGz(tarball, thirdPartyDir);
    artifacts.push(sourceDir);
    console.log(
      '[fetch-sdl3] No system libsdl3-dev found. SDL3 source is extracted; build and install it yourself:\n' +
        `[fetch-sdl3]   cmake -S "${sourceDir}" -B "${sourceDir}/build" -DCMAKE_BUILD_TYPE=Release\n` +
        `[fetch-sdl3]   cmake --build "${sourceDir}/build" --parallel\n` +
        `[fetch-sdl3]   sudo cmake --install "${sourceDir}/build"`,
    );
  }
  if (commandSucceeds('pkg-config', ['--exists', 'libusb-1.0'])) {
    console.log('[fetch-sdl3] Found system libusb-1.0 via pkg-config.');
  } else {
    console.warn('[fetch-sdl3] libusb-1.0 not found. Install it via your package manager, e.g. `sudo apt install libusb-1.0-0-dev`.');
  }
  return artifacts;
};

const fetchMac = async ({ sdl3Version }, fetchAndVerify) => {
  if (commandSucceeds('pkg-config', ['--exists', 'sdl3'])) {
    console.log('[fetch-sdl3] Found system SDL3 via pkg-config (e.g. from Homebrew) — using it, skipping download.');
  } else {
    const dmg = await fetchAndVerify(
      `https://github.com/libsdl-org/SDL/releases/download/release-${sdl3Version}/SDL3-${sdl3Version}.dmg`,
      `SDL3-${sdl3Version}.dmg`,
    );
    console.log(
      `[fetch-sdl3] Downloaded ${dmg} — this script does not mount it. Open it in Finder, then either\n` +
        '[fetch-sdl3] drag SDL3.framework to /Library/Frameworks, or `brew install sdl3` instead.',
    );
  }
  if (!commandSucceeds('pkg-config', ['--exists', 'libusb-1.0'])) {
    console.warn('[fetch-sdl3] libusb-1.0 not found. Install it via `brew install libusb`.');
  }
  return ['system'];
};

export { fetchWindows, fetchLinux, fetchMac };
