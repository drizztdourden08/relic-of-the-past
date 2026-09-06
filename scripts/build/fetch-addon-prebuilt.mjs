/* @layer tooling-scripts @kind build */
/**
 * Downloads and unpacks a released prebuilt of the native controller-input addon
 * (the transport half of ensure-sdl3.mjs). Returns a result instead of throwing,
 * and reports "absent" separately from "failed": no release for a platform is
 * the normal state until someone cuts a build for it.
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

/** @returns {Promise<'installed' | 'absent' | 'failed'>} `absent`: no such release asset yet. */
const fetchAddonPrebuilt = async (params) => {
  const { addonVersion, buildKey, platformArch, outDir, tmpDir } = params;
  // An asset of the app's latest release ("Package the input addon" in
  // .github/workflows/release.yml). The name carries the build key (addon version +
  // pinned SDL3 + libusb), so a moved pin 404s here and the caller builds locally
  // instead of installing a mismatched binary.
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
