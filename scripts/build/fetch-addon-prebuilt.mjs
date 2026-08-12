/* @layer tooling-scripts @kind build */
/**
 * Downloads and unpacks a released prebuilt of the native controller-input
 * addon. Split out from ensure-sdl3.mjs so that script stays a readable
 * statement of policy (when to fetch, when to build, when to leave things
 * alone) rather than a mix of policy and transport.
 *
 * Returns a result rather than throwing, and reports "absent" separately from
 * "failed": a release that was never published is the normal state of a
 * platform nobody has cut a build for yet, not an error worth alarming
 * anyone about.
 */
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { downloadFile, sha256File } from './fetch-sdl3-helpers.mjs';

const RELEASE_REPO = 'drizztdourden08/relic-of-the-past';

const verifyAgainstSidecar = async (assetUrl, archiveName, archivePath) => {
  try {
    const sidecar = await fetch(`${assetUrl}.sha256`);
    if (!sidecar.ok) {
      console.warn(`[ensure-sdl3] No .sha256 sidecar for ${archiveName}; proceeding unverified.`);
      return;
    }
    const expected = (await sidecar.text()).trim().split(/\s+/)[0];
    const actual = sha256File(archivePath);
    if (expected && actual !== expected) {
      throw new Error(`checksum mismatch for ${archiveName} (expected ${expected}, got ${actual})`);
    }
  } catch (err) {
    if (err.message.startsWith('checksum mismatch')) throw err;
    console.warn(`[ensure-sdl3] Could not verify ${archiveName}: ${err.message}; proceeding unverified.`);
  }
};

/**
 * @returns {Promise<'installed' | 'absent' | 'failed'>} `absent` means no such
 * release asset exists, which is expected until a build has been published.
 */
const fetchAddonPrebuilt = async (params) => {
  const { addonVersion, buildKey, platformArch, outDir, tmpDir } = params;
  // The addon ships as an asset of the app's own latest release (see the
  // "Package the input addon" step in .github/workflows/release.yml). The
  // asset name carries the build key, a digest of the addon version plus the
  // pinned SDL3 and libusb, so a checkout only ever accepts a binary built
  // from the same three inputs it is pinned to. Any of them moving past what
  // the latest release carries 404s here, and the caller builds locally
  // rather than silently installing a mismatched binary.
  const archiveName = `sdl3-input-${addonVersion}-${buildKey}-${platformArch}.tar.gz`;
  const assetUrl = `https://github.com/${RELEASE_REPO}/releases/latest/download/${archiveName}`;
  const archivePath = join(tmpDir, archiveName);

  try {
    mkdirSync(tmpDir, { recursive: true });
    const head = await fetch(assetUrl, { method: 'HEAD' });
    if (head.status === 404) return 'absent';

    await downloadFile(assetUrl, archivePath);
    await verifyAgainstSidecar(assetUrl, archiveName, archivePath);
    mkdirSync(outDir, { recursive: true });
    execFileSync('tar', ['--force-local', '-xzf', archivePath.replace(/\\/g, '/'), '-C', outDir.replace(/\\/g, '/')], { stdio: 'inherit' });
    console.log(`[ensure-sdl3] Installed prebuilt addon v${addonVersion} for ${platformArch}.`);
    return 'installed';
  } catch (err) {
    console.warn(`[ensure-sdl3] Could not install the prebuilt for ${platformArch}: ${err.message}`);
    return 'failed';
  } finally {
    if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
  }
};

export { fetchAddonPrebuilt };
