/* @layer tooling-scripts @kind build */
/**
 * Ensure the SDL3 native controller-input addon (sdl3_input.node plus its
 * SDL3/libusb shared libraries) is present and current before dev/build —
 * with NO C++ toolchain required on a fresh clone.
 *
 * Fast path (every normal dev/build): a marker keyed on the addon's own
 * version (apps/desktop/electron/input/native/sdl3/package.json) + platform +
 * arch matches what's on disk, and the addon's C++ sources are no newer than
 * the build -> no-op.
 *
 * Cold path (fresh clone, or an addon version bump): download the matching
 * prebuilt package for this platform+arch from the app's latest GitHub
 * Release, where it rides along as one asset among the installers (built by
 * the "Package the input addon" step in .github/workflows/release.yml),
 * verify its SHA-256 against the .sha256 sidecar published next to it, and
 * unpack both into apps/desktop/electron/input/native/sdl3/prebuilds/
 * <platform>-<arch>/ — the location index.ts's resolveAddonPath checks first.
 *
 * Fallback (no prebuilt for this platform/arch, or the addon's C++ is newer
 * than the last local build): build from source via fetch-sdl3.mjs +
 * build-sdl3.mjs (SDL3 itself, with SDL_HIDAPI_LIBUSB=ON) + cmake-js (the
 * addon). This is the ONLY path that needs a C/C++ toolchain — a missing
 * `cmake` fails with that explanation, not a buried cmake-js error.
 *
 * Never fails a fresh `npm install`/`dev`/`build` outright: a missing addon
 * degrades to "this transport is unavailable" (index.ts already handles
 * that), the same as before this addon existed. A network error or a failed
 * local build only warns, and keeps whatever usable build already exists.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, resolve, extname } from 'node:path';
import { fetchAddonPrebuilt } from './build/fetch-addon-prebuilt.mjs';

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

const repoRoot = resolve(import.meta.dirname, '..');
const addonDir = join(repoRoot, 'apps/desktop/electron/input/native/sdl3');
const platformArch = `${process.platform}-${process.arch}`;
const outDir = join(addonDir, 'prebuilds', platformArch);
const nodeFile = join(outDir, 'sdl3_input.node');
const markerPath = join(addonDir, 'prebuilds', `.ensured-${platformArch}.json`);
const force = process.argv.includes('--force');
const RELEASE_REPO = 'drizztdourden08/relic-of-the-past';
const WIN_PLATFORM = { x64: 'x64', ia32: 'Win32', arm64: 'ARM64' };

/**
 * Short digest of everything compiled into the addon binary: our own version
 * plus the pinned SDL3 and libusb. It names the published artifact and keys
 * the local freshness marker, so changing any one of the three yields a name
 * nothing has published yet and a marker that no longer matches. Deriving it
 * beats bumping a version by hand: a raised SDL pin with the addon version
 * left alone would otherwise keep a stale binary in place, and a wrong SDL
 * build looks perfectly healthy right up until a controller does not work.
 */
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
 * Whether the addon on disk still satisfies this checkout, and if not, why.
 *
 * The reason matters because it decides who needs a compiler. Source
 * timestamps only mean "you are editing this code" for a build that was
 * compiled here. A downloaded prebuilt has no relationship to local file
 * times: pulling a commit that touches the addon makes every source newer
 * than it, which would otherwise force a local build on someone who never
 * works on controllers. For those installs the pinned addon version is the
 * only thing that decides freshness, and a version bump means a new prebuilt
 * to fetch, not a compiler to install.
 *
 * @returns {'current' | 'missing' | 'version-changed' | 'sources-edited'}
 */
const addonState = (pinned) => {
  const marker = readMarker();
  if (!marker || !hasUsableBuild()) return 'missing';
  if (marker.buildKey !== pinned.buildKey || marker.platform !== process.platform || marker.arch !== process.arch) {
    return 'version-changed';
  }
  // A marker written before provenance was recorded is treated as local, the
  // conservative reading: it may hold someone's own build, and rebuilding is
  // cheap next to running a binary that silently lacks their changes.
  const compiledHere = marker.source !== 'prebuilt';
  if (compiledHere && sourcesNewerThanBuild()) return 'sources-edited';
  return 'current';
};

/** `source` records whether this build was compiled here or downloaded, which
 *  is what makes the source-timestamp check meaningful or meaningless. */
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

// A toolchain can be installed without `cmake` being on PATH: Visual Studio
// ships its own copy, which is why a build can succeed from one shell and
// appear impossible from another. Check the bare command, then let cmake-js
// resolve it the way it will during the real build.
const hasCmake = () => {
  try {
    execFileSync('cmake', ['--version'], { stdio: 'ignore' });
    return true;
  } catch { /* not on PATH; cmake-js may still find it */ }
  return findBundledCmake() !== null;
};

// Visual Studio installs CMake inside its own tree and does not add it to the
// system PATH, so a machine with a complete toolchain still answers "no cmake"
// from an ordinary shell. Look where it actually lives before concluding a
// build is impossible.
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

// Copies the addon's own build output plus the SDL3/libusb shared libraries
// build-sdl3.mjs installed into outDir — the payload index.ts's
// resolveAddonPath expects at apps/.../prebuilds/<platform>-<arch>/.
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
    execFileSync('node', [join(repoRoot, 'scripts/build/fetch-sdl3.mjs')], { stdio: 'inherit', env });
    execFileSync('node', [join(repoRoot, 'scripts/build/build-sdl3.mjs')], { stdio: 'inherit', env });
    const sdlConfigDir = sdl3ConfigDir(installDir);
    if (!sdlConfigDir) throw new Error(`No SDL3Config.cmake found under ${installDir} after building SDL3.`);
    const cmakeJsArgs = ['build', '-d', addonDir, '-O', buildDir, '-B', 'Release', `--CDSDL3_DIR=${sdlConfigDir.replace(/\\/g, '/')}`];
    if (process.platform === 'win32') cmakeJsArgs.push('-A', WIN_PLATFORM[process.arch] ?? 'x64');
    execFileSync('node', [join(repoRoot, 'node_modules/cmake-js/bin/cmake-js'), ...cmakeJsArgs], { stdio: 'inherit', cwd: repoRoot, env });
    copyBuiltArtifacts(buildDir, installDir);
    return hasUsableBuild() ? 'built' : 'failed';
  } catch (err) {
    // The compile itself usually succeeds and the copy is what fails, because
    // a running app holds the addon and its libraries open. That is a normal
    // thing to hit mid-session and needs a different answer from a real
    // build error, so it is reported as its own outcome.
    if (err.code === 'EBUSY' || /EBUSY|EPERM/.test(err.message)) return 'locked';
    console.warn(`[ensure-sdl3] Local addon build failed: ${err.message}`);
    return 'failed';
  }
};

const main = async () => {
  const pinned = readPinned();
  const state = force ? 'version-changed' : addonState(pinned);
  if (state === 'current') {
    console.log(`[ensure-sdl3] Native addon is up to date (${platformArch}).`);
    return;
  }

  // Only one of these situations needs a compiler.
  //
  // sources-edited: this checkout compiled the addon and its C++ has changed
  // since. A published prebuilt is built from committed sources and cannot
  // contain those edits, so fetching one would replace the work with an older
  // binary. Build locally or keep what is there.
  //
  // missing / version-changed: a fresh clone, or a pinned version bump. A
  // prebuilt is exactly right, and is what lets anyone who does not work on
  // controllers get a working app with no toolchain at all.
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

  console.log(`[ensure-sdl3] Ensuring native addon v${pinned.addonVersion} (SDL ${pinned.sdl3Version}, libusb ${pinned.libusbVersion}) for ${platformArch}...`);
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
