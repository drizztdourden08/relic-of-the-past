/* @layer tooling-scripts @kind build */
/**
 * Check that the SDL3 native controller-input addon (sdl3_input.node plus its
 * SDL3/libusb libraries) is present and current before dev/build, with no C++
 * toolchain needed on a fresh clone.
 *
 * Fast path: the marker (addon version + platform + arch) matches disk and the C++
 * sources are no newer than the build. Cold path: download the prebuilt for this
 * platform+arch from the app's latest GitHub Release ("Package the input addon" in
 * .github/workflows/release.yml), verify it against the .sha256 sidecar, unpack into
 * apps/desktop/electron/input/native/sdl3/prebuilds/<platform>-<arch>/. Fallback:
 * build from source via fetch-sdl3.mjs + build-sdl3.mjs + cmake-js; the only path
 * that needs a toolchain.
 *
 * Never fails `npm install`/`dev`/`build` outright: a missing addon degrades to
 * "this transport is unavailable" (index.ts handles that).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, resolve, extname } from 'node:path';
import { fetchAddonPrebuilt } from './build/fetch-addon-prebuilt.mjs';

// SDL installs its CMake config under the prefix on Windows and under lib/cmake elsewhere.
const sdl3ConfigDir = (installDir) => {
  const candidates = [
    join(installDir, 'cmake'),
    join(installDir, 'lib', 'cmake', 'SDL3'),
    join(installDir, 'lib64', 'cmake', 'SDL3'),
  ];
  return candidates.find((dir) => existsSync(join(dir, 'SDL3Config.cmake'))) ?? null;
};

const repoRoot = resolve(import.meta.dirname, '..');
const addonDir = join(repoRoot, 'apps/desktop/electron/input/native/sdl3');
const platformArch = `${process.platform}-${process.arch}`;
const outDir = join(addonDir, 'prebuilds', platformArch);
const nodeFile = join(outDir, 'sdl3_input.node');
const markerPath = join(addonDir, 'prebuilds', `.ensured-${platformArch}.json`);
const force = process.argv.includes('--force');
const RELEASE_REPO = 'drizztdourden08/relic-of-the-past';
const WIN_PLATFORM = { x64: 'x64', ia32: 'Win32', arm64: 'ARM64' };

// Digest of everything compiled into the addon: our version plus the pinned SDL3
// and libusb. It names the published artifact and keys the freshness marker, so a
// raised SDL pin alone invalidates a stale binary (which otherwise looks healthy
// until a controller does not work).
const buildKeyOf = ({ addonVersion, sdl3Version, libusbVersion }) =>
  createHash('sha256').update(`${addonVersion}|${sdl3Version}|${libusbVersion}`).digest('hex').slice(0, 8);

const readPinned = () => {
  const pkg = JSON.parse(readFileSync(join(addonDir, 'package.json'), 'utf8'));
  if (!pkg.version || !pkg.sdl3 || !pkg.libusb) {
    console.error('[ensure-sdl3] apps/desktop/electron/input/native/sdl3/package.json must declare "version", "sdl3", and "libusb" fields.');
    process.exit(1);
  }
  const pinned = { addonVersion: pkg.version, sdl3Version: pkg.sdl3, libusbVersion: pkg.libusb };
  return { ...pinned, buildKey: buildKeyOf(pinned) };
};

const readMarker = () => {
  if (!existsSync(markerPath)) return null;
  try {
    return JSON.parse(readFileSync(markerPath, 'utf8'));
  } catch {
    return null;
  }
};

const SOURCE_EXTS = new Set(['.cc', '.h']);
const newestSourceMtime = (dir) => {
  let newest = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) newest = Math.max(newest, newestSourceMtime(full));
    else if (SOURCE_EXTS.has(extname(entry.name))) newest = Math.max(newest, statSync(full).mtimeMs);
  }
  return newest;
};

const hasUsableBuild = () => existsSync(nodeFile);

const sourcesNewerThanBuild = () =>
  statSync(nodeFile).mtimeMs < Math.max(newestSourceMtime(join(addonDir, 'src')), statSync(join(addonDir, 'CMakeLists.txt')).mtimeMs);

/**
 * Whether the addon on disk still satisfies this checkout, and if not, why. Source
 * timestamps only mean "you are editing this" for a build compiled here; for a
 * downloaded prebuilt, pulling a commit makes every source newer, so only the
 * pinned version decides freshness there.
 *
 * @returns {'current' | 'missing' | 'version-changed' | 'sources-edited'}
 */
const addonState = (pinned) => {
  const marker = readMarker();
  if (!marker || !hasUsableBuild()) return 'missing';
  if (marker.buildKey !== pinned.buildKey || marker.platform !== process.platform || marker.arch !== process.arch) {
    return 'version-changed';
  }
  // A marker without provenance is treated as local: it may hold someone's own build.
  const compiledHere = marker.source !== 'prebuilt';
  if (compiledHere && sourcesNewerThanBuild()) return 'sources-edited';
  return 'current';
};

/** `source` records whether this build was compiled here or downloaded (see addonState). */
const writeMarker = (pinned, source) => {
  mkdirSync(join(addonDir, 'prebuilds'), { recursive: true });
  writeFileSync(markerPath, JSON.stringify({
    buildKey: pinned.buildKey,
    addonVersion: pinned.addonVersion,
    sdl3Version: pinned.sdl3Version,
    libusbVersion: pinned.libusbVersion,
    platform: process.platform,
    arch: process.arch,
    source,
    ensuredAt: new Date().toISOString(),
  }, null, 2));
};

// Visual Studio ships its own cmake without adding it to PATH, so check the bare
// command first, then the VS tree.
const hasCmake = () => {
  try {
    execFileSync('cmake', ['--version'], { stdio: 'ignore' });
    return true;
  } catch { /* not on PATH; cmake-js may still find it */ }
  return findBundledCmake() !== null;
};

const findBundledCmake = () => {
  if (process.platform !== 'win32') return null;
  const roots = [process.env['ProgramFiles(x86)'], process.env.ProgramFiles].filter(Boolean);
  const tail = join('Common7', 'IDE', 'CommonExtensions', 'Microsoft', 'CMake', 'CMake', 'bin');
  for (const root of roots) {
    const vsDir = join(root, 'Microsoft Visual Studio');
    if (!existsSync(vsDir)) continue;
    for (const year of readdirSync(vsDir)) {
      const yearDir = join(vsDir, year);
      if (!statSync(yearDir).isDirectory()) continue;
      for (const edition of readdirSync(yearDir)) {
        const candidate = join(yearDir, edition, tail);
        if (existsSync(join(candidate, 'cmake.exe'))) return candidate;
      }
    }
  }
  return null;
};

// Copies the addon's build output plus the SDL3/libusb libraries into outDir, the
// payload index.ts's resolveAddonPath expects at apps/.../prebuilds/<platform>-<arch>/.
const copyBuiltArtifacts = (buildDir, installDir) => {
  mkdirSync(outDir, { recursive: true });
  const releaseDir = existsSync(join(buildDir, 'Release', 'sdl3_input.node')) ? join(buildDir, 'Release') : buildDir;
  const runtimeExt = /\.(node|dll|dylib|so(\.\d+)*)$/i;
  for (const f of readdirSync(releaseDir)) if (runtimeExt.test(f)) copyFileSync(join(releaseDir, f), join(outDir, f));
  const installLibDir = join(installDir, process.platform === 'win32' ? 'bin' : 'lib');
  if (existsSync(installLibDir)) for (const f of readdirSync(installLibDir)) if (/libusb/i.test(f) && runtimeExt.test(f)) copyFileSync(join(installLibDir, f), join(outDir, f));
};

const buildFromSource = (pinned) => {
  if (!hasCmake()) return 'no-toolchain';
  const bundledCmake = findBundledCmake();
  const env = bundledCmake ? { ...process.env, PATH: `${bundledCmake};${process.env.PATH ?? ''}` } : process.env;
  const installDir = join(repoRoot, 'third_party/sdl3/install', platformArch);
  const buildDir = join(repoRoot, 'third_party/sdl3', `addon-build-${platformArch}`);
  try {
    console.log('[ensure-sdl3] Building the native addon from source (this needs a C/C++ toolchain)...');
    // --force must reach both children: each keeps its own freshness marker and
    // would otherwise skip. A release relies on this to rebuild SDL.
    const forceArgs = force ? ['--force'] : [];
    execFileSync('node', [join(repoRoot, 'scripts/build/fetch-sdl3.mjs'), ...forceArgs], { stdio: 'inherit', env });
    execFileSync('node', [join(repoRoot, 'scripts/build/build-sdl3.mjs'), ...forceArgs], { stdio: 'inherit', env });
    const sdlConfigDir = sdl3ConfigDir(installDir);
    if (!sdlConfigDir) throw new Error(`No SDL3Config.cmake found under ${installDir} after building SDL3.`);
    const cmakeJsArgs = ['build', '-d', addonDir, '-O', buildDir, '-B', 'Release', `--CDSDL3_DIR=${sdlConfigDir.replace(/\\/g, '/')}`];
    if (process.platform === 'win32') cmakeJsArgs.push('-A', WIN_PLATFORM[process.arch] ?? 'x64');
    execFileSync('node', [join(repoRoot, 'node_modules/cmake-js/bin/cmake-js'), ...cmakeJsArgs], { stdio: 'inherit', cwd: repoRoot, env });
    copyBuiltArtifacts(buildDir, installDir);
    return hasUsableBuild() ? 'built' : 'failed';
  } catch (err) {
    // Usually the copy fails, not the compile: a running app holds the addon open.
    if (err.code === 'EBUSY' || /EBUSY|EPERM/.test(err.message)) return 'locked';
    console.warn(`[ensure-sdl3] Local addon build failed: ${err.message}`);
    return 'failed';
  }
};

const main = async () => {
  const pinned = readPinned();

  // --force means "build it here, now". It once routed into the prebuilt fetch, so a
  // release got the previous release's binary forever. No prebuilt fallback here.
  if (force) {
    console.log(`[ensure-sdl3] --force: building from source for ${platformArch}, ignoring any published prebuilt.`);
    if (buildFromSource(pinned) === 'built') {
      writeMarker(pinned, 'local');
      console.log(`[ensure-sdl3] Native addon built at ${outDir}`);
      return;
    }
    console.error('[ensure-sdl3] --force was asked for a fresh build and it failed. Not falling back to a published prebuilt, since that would ship something other than this commit.');
    process.exit(1);
  }

  const state = addonState(pinned);
  if (state === 'current') {
    console.log(`[ensure-sdl3] Native addon is up to date (${platformArch}).`);
    return;
  }

  // sources-edited: local C++ changes a prebuilt cannot contain, so build locally or
  // keep what is there. missing / version-changed: a prebuilt is exactly right.
  if (state === 'sources-edited') {
    const outcome = buildFromSource(pinned);
    if (outcome === 'built') {
      writeMarker(pinned, 'local');
      console.log(`[ensure-sdl3] Native addon rebuilt at ${outDir}`);
      return;
    }
    if (outcome === 'locked') {
      console.warn('[ensure-sdl3] The addon rebuilt, but its files are in use by a running instance, so the new build could not be installed. Close the app and run this again.');
      return;
    }
    const why = outcome === 'no-toolchain' ? 'no CMake toolchain was found to rebuild it' : 'the rebuild failed';
    console.warn(`[ensure-sdl3] The addon C++ changed since it was last built, and ${why}. The app will run the PREVIOUS build, without those changes.`);
    return;
  }

  console.log(`[ensure-sdl3] Preparing native addon v${pinned.addonVersion} (SDL ${pinned.sdl3Version}, libusb ${pinned.libusbVersion}) for ${platformArch}...`);
  const fetched = await fetchAddonPrebuilt({
    addonVersion: pinned.addonVersion,
    buildKey: pinned.buildKey,
    platformArch,
    outDir,
    tmpDir: join(addonDir, 'prebuilds', '.download-tmp'),
  });
  if (fetched === 'installed') {
    writeMarker(pinned, 'prebuilt');
    console.log(`[ensure-sdl3] Native addon ready at ${outDir}`);
    return;
  }
  if (fetched === 'absent') console.log(`[ensure-sdl3] No published build for ${platformArch} yet; building from source.`);

  if (buildFromSource(pinned) === 'built') {
    writeMarker(pinned, 'local');
    console.log(`[ensure-sdl3] Native addon ready at ${outDir}`);
    return;
  }
  if (hasUsableBuild()) {
    console.warn('[ensure-sdl3] Could not refresh the native addon; keeping the build already on disk.');
    return;
  }
  console.warn(
    '[ensure-sdl3] The native controller-input addon could not be prepared, so controllers will not be detected. ' +
      'Building it needs CMake and a C/C++ toolchain (MSVC on Windows, gcc or clang elsewhere). Everything else in the app still runs.',
  );
};

main();
