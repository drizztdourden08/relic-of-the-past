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

// Every platform builds SDL from this source tree (see build-sdl3.mjs), so the
// source is always fetched, never an official prebuilt and never a system
// package. Those are all compiled without libusb, which is the one thing this
// addon needs, so none of them can stand in for a build of our own.
const fetchSdlSource = async (sdl3Version, fetchAndVerify, thirdPartyDir) => {
  const tarball = await fetchAndVerify(
    `https://github.com/libsdl-org/SDL/releases/download/release-${sdl3Version}/SDL3-${sdl3Version}.tar.gz`,
    `SDL3-${sdl3Version}.tar.gz`,
  );
  const sourceDir = join(thirdPartyDir, `SDL3-${sdl3Version}`);
  extractTarGz(tarball, thirdPartyDir);
  if (!existsSync(join(sourceDir, 'CMakeLists.txt'))) {
    throw new Error(`Expected ${sourceDir}/CMakeLists.txt after extracting SDL3 source — the tarball layout may have changed.`);
  }
  console.log(`[fetch-sdl3] SDL3 source ready at ${sourceDir}`);
  return sourceDir;
};

const fetchWindows = async ({ sdl3Version, libusbVersion }, fetchAndVerify, thirdPartyDir) => {
  const artifacts = [];

  artifacts.push(await fetchSdlSource(sdl3Version, fetchAndVerify, thirdPartyDir));

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
  const artifacts = [await fetchSdlSource(sdl3Version, fetchAndVerify, thirdPartyDir)];
  if (!commandSucceeds('pkg-config', ['--exists', 'libusb-1.0'])) {
    console.warn('[fetch-sdl3] libusb-1.0 not found. Install it via your package manager, e.g. `sudo apt install libusb-1.0-0-dev`.');
  }
  return artifacts;
};

const fetchMac = async ({ sdl3Version }, fetchAndVerify, thirdPartyDir) => {
  const artifacts = [await fetchSdlSource(sdl3Version, fetchAndVerify, thirdPartyDir)];
  if (!commandSucceeds('pkg-config', ['--exists', 'libusb-1.0'])) {
    console.warn('[fetch-sdl3] libusb-1.0 not found. Install it via `brew install libusb`.');
  }
  return artifacts;
};

export { fetchWindows, fetchLinux, fetchMac };
