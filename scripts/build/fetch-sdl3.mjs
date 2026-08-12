/* @layer tooling-scripts @kind logic */
/**
 * Fetch the pinned SDL3 + libusb binaries used by the native controller-input
 * addon (apps/desktop/electron/input/native) into third_party/sdl3/ (gitignored).
 *
 * Versions are pinned in apps/desktop/electron/input/native/sdl3/package.json
 * ("sdl3" / "libusb" top-level fields), never hardcoded here — bumping a
 * version is a one-line diff there, not a script edit.
 *
 * Every downloaded archive is checked against the CHECKSUMS map below:
 *   - a present hash that doesn't match is a hard error (corrupted/tampered);
 *   - a null hash means "not pinned yet" — the script computes and PRINTS the
 *     real SHA-256 with a loud warning, then proceeds unverified. Check that
 *     hash against the GitHub release page and paste it into the map so the
 *     next run is actually verified.
 *
 * Per-platform behavior lives in fetch-sdl3-platforms.mjs. Every platform
 * fetches SDL3 SOURCE (never the official SDL3-devel-*-VC.zip on Windows —
 * that prebuilt is compiled without libusb, so no official prebuilt can ever
 * give us the Switch 2 driver). Linux/macOS use a system SDL3/libusb via
 * pkg-config when present. Building the fetched source (with
 * SDL_HIDAPI_LIBUSB=ON) is scripts/build/build-sdl3.mjs's job, not this one's.
 *
 * Idempotent: re-running with matching pinned versions and an intact
 * extraction is a no-op. Pass --force to redo the fetch anyway.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { downloadFile, verifyChecksum } from './fetch-sdl3-helpers.mjs';
import { fetchWindows, fetchLinux, fetchMac } from './fetch-sdl3-platforms.mjs';

// SHA-256 of each artifact, keyed by its exact release filename. Update this
// when bumping a pinned version — see the header comment for the null-hash flow.
// No entry for SDL3-devel-3.4.14-VC.zip: that official Windows prebuilt is
// compiled without libusb (see the header comment) and is no longer fetched by
// anyone on this list, so pinning its checksum would just be a dead entry.
const CHECKSUMS = {
  'SDL3-3.4.14.tar.gz': '30d4aa2b3037718142b32dffd4e72f917ebb6cc5227150e7bb9c45efb2153aeb',
  'libusb-1.0.30.7z': '7fb1dfec805b97983763d7d0ae244320da12add1003d4249c96cc4d586398c79',
};

const repoRoot = resolve(import.meta.dirname, '..', '..');
const pinnedPkgPath = join(repoRoot, 'apps/desktop/electron/input/native/sdl3/package.json');
const thirdPartyDir = join(repoRoot, 'third_party/sdl3');
const downloadsDir = join(thirdPartyDir, 'downloads');
const markerPath = join(thirdPartyDir, '.fetched.json');
const force = process.argv.includes('--force');

const readPinnedVersions = () => {
  if (!existsSync(pinnedPkgPath)) {
    console.error(`[fetch-sdl3] Missing ${pinnedPkgPath} — it must declare "sdl3" and "libusb" version fields.`);
    process.exit(1);
  }
  const pkg = JSON.parse(readFileSync(pinnedPkgPath, 'utf8'));
  if (!pkg.sdl3 || !pkg.libusb) {
    console.error(`[fetch-sdl3] ${pinnedPkgPath} must declare top-level "sdl3" and "libusb" version fields.`);
    process.exit(1);
  }
  return { sdl3Version: pkg.sdl3, libusbVersion: pkg.libusb };
};

const readMarker = () => {
  if (!existsSync(markerPath)) return null;
  try {
    return JSON.parse(readFileSync(markerPath, 'utf8'));
  } catch {
    return null;
  }
};

const isUpToDate = (pinned) => {
  const marker = readMarker();
  if (!marker) return false;
  return (
    marker.sdl3Version === pinned.sdl3Version &&
    marker.libusbVersion === pinned.libusbVersion &&
    marker.platform === process.platform &&
    marker.artifacts.every((p) => p === 'system' || existsSync(p))
  );
};

const writeMarker = (pinned, artifacts) => {
  mkdirSync(thirdPartyDir, { recursive: true });
  writeFileSync(
    markerPath,
    JSON.stringify({ ...pinned, platform: process.platform, artifacts, fetchedAt: new Date().toISOString() }, null, 2),
  );
};

// Downloads `filename` from `url` into downloadsDir (skipping if already
// there, unless --force) and verifies it against CHECKSUMS before returning.
const fetchAndVerify = async (url, filename) => {
  const dest = join(downloadsDir, filename);
  if (force || !existsSync(dest)) await downloadFile(url, dest);
  else console.log(`[fetch-sdl3] Already downloaded: ${filename}`);
  verifyChecksum(dest, CHECKSUMS[filename], filename);
  return dest;
};

const main = async () => {
  const pinned = readPinnedVersions();
  if (!force && isUpToDate(pinned)) {
    console.log(`[fetch-sdl3] Up to date (sdl3 ${pinned.sdl3Version}, libusb ${pinned.libusbVersion}). Pass --force to redo it.`);
    return;
  }

  console.log(`[fetch-sdl3] Fetching sdl3 ${pinned.sdl3Version} + libusb ${pinned.libusbVersion} for ${process.platform}...`);
  const byPlatform = { win32: fetchWindows, linux: fetchLinux, darwin: fetchMac };
  const fetchForPlatform = byPlatform[process.platform];
  if (!fetchForPlatform) {
    console.error(`[fetch-sdl3] Unsupported platform: ${process.platform}`);
    process.exit(1);
  }
  const artifacts = await fetchForPlatform(pinned, fetchAndVerify, thirdPartyDir);
  writeMarker(pinned, artifacts);
  console.log('[fetch-sdl3] Done.');
};

main().catch((err) => {
  console.error(`[fetch-sdl3] ${err.message}`);
  process.exit(1);
});
