/* @layer tooling-scripts @kind logic */
/**
 * Fetch the pinned SDL3 source + libusb for the native controller-input addon into
 * third_party/sdl3/ (gitignored). Versions come from
 * apps/desktop/electron/input/native/sdl3/package.json ("sdl3" / "libusb").
 *
 * Every archive is checked against CHECKSUMS: a mismatch is a hard error; a null
 * hash prints the real SHA-256 with a warning and proceeds, so paste it into the
 * map afterwards. Always SDL3 source, never the official SDL3-devel-*-VC.zip: that
 * prebuilt lacks libusb. Building it is scripts/build/build-sdl3.mjs's job.
 * Idempotent; --force redoes the fetch.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { downloadFile, verifyChecksum } from './fetch-sdl3-helpers.mjs';
import { fetchWindows, fetchLinux, fetchMac } from './fetch-sdl3-platforms.mjs';

// SHA-256 per exact release filename. Update when bumping a pin (null-hash flow in
// the header). No entry for SDL3-devel-*-VC.zip: it is never fetched.
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
    console.error(`[fetch-sdl3] Missing ${pinnedPkgPath}. It must declare "sdl3" and "libusb" version fields.`);
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
