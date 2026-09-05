/* @layer tooling-scripts @kind logic */
/**
 * Packs a built app tree (electron-builder `--win --dir`) into a Velopack release:
 * the update package, a delta, the release index, and on --full the setup and
 * portable builds too.
 *
 *   node scripts/build/pack-velopack.mjs                     routine: package + delta
 *   node scripts/build/pack-velopack.mjs --full              also setup + portable
 *   node scripts/build/pack-velopack.mjs --channel beta      a test channel
 *   node scripts/build/pack-velopack.mjs --pack-dir <dir> --out <dir>
 *
 * Setup and portable zip are each another whole copy of the payload and neither is
 * read by an update, so a routine release is ~137 MB instead of ~418 MB. `vpk` is a
 * .NET global tool; when missing this fails with the install command.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync, unlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const root = process.cwd();
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8')).version;

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const channel = arg('channel');
// Linux packs an AppImage, not a setup, and needs a PNG icon, not an ico.
const linux = process.argv.includes('--linux');
// Only a full release carries the two artifacts people download by hand.
const full = process.argv.includes('--full');
const packDir = arg('pack-dir', join('release', 'win-unpacked'));
const outputDir = arg('out', join('release', 'velopack'));

if (!existsSync(join(root, packDir))) {
  throw new Error(`${packDir} is missing. Run electron-builder with --dir first.`);
}

const notesPath = join(root, 'release-notes', `v${version}.md`);

const args = [
  'pack',
  '--packId', 'relic-of-the-past',
  '--packVersion', version,
  '--packTitle', 'Relic of the Past',
  '--packAuthors', 'drizztdourden_',
  '--packDir', packDir,
  '--mainExe', linux ? 'relic-of-the-past' : 'Relic of the Past.exe',
  '--icon', linux
    ? join('apps', 'web', 'public', 'logos', 'logo-256.png')
    : join('apps', 'web', 'public', 'logos', 'icon.ico'),
  '--outputDir', outputDir,
];

// Linux stays on vpk's default gzip. The AppImage runtime vpk embeds reads zlib and
// zstd only, so an xz payload packs fine and then cannot be mounted at launch.
if (!linux) {
  // The Windows setup's install window: same artwork as the boot splash, and the
  // app's accent instead of Velopack's green.
  args.push('--splashImage', join('build', 'installer-splash.gif'));
  args.push('--splashProgressColor', '#E8A33D');
}

// Notes travel inside the package, which is what lets the update dialog show them
// without a second request to the release API.
if (existsSync(notesPath)) args.push('--releaseNotes', notesPath);
// A channel keeps test builds in their own feed, invisible to anyone on stable.
if (channel) args.push('--channel', channel);
// vpk rejects --noInst and --noPortable together, so the setup is skipped by flag
// and the portable zip is deleted afterwards. An AppImage is the whole artifact.
if (!full && !linux) args.push('--noInst');

// A freshly installed global tool is not on PATH until the shell restarts, so the
// well-known tools directory is tried before giving up.
const vpkCommand = () => {
  const local = join(homedir(), '.dotnet', 'tools', 'vpk.exe');
  return existsSync(local) ? local : 'vpk';
};

try {
  execFileSync(vpkCommand(), args, { stdio: 'inherit', cwd: root });
} catch (err) {
  if (err.code === 'ENOENT') {
    throw new Error('vpk is not installed. Run: dotnet tool install -g vpk --version 1.2.110-ge826545');
  }
  throw err;
}

/**
 * rotp-windows-setup.exe is the small downloader stub the site links, not this
 * file: this is the payload the stub fetches and runs silently. The zip is kept
 * for installs into a chosen directory. Updates go through the .nupkg named in the
 * release index, left as vpk wrote it.
 */
const rename = (from, to) => {
  const source = join(root, outputDir, from);
  if (existsSync(source)) renameSync(source, join(root, outputDir, to));
};

const suffix = channel ?? (linux ? 'linux' : 'win');
if (linux) {
  // vpk puts the channel in the setup filename but not the AppImage's, so both are
  // tried; renaming the wrong one once shipped an AppImage under vpk's own name.
  rename(`relic-of-the-past-${suffix}.AppImage`, 'rotp-linux.AppImage');
  rename('relic-of-the-past.AppImage', 'rotp-linux.AppImage');
} else if (full) {
  rename(`relic-of-the-past-${suffix}-Setup.exe`, 'rotp-windows-payload.exe');
  rename(`relic-of-the-past-${suffix}-Portable.zip`, 'rotp-windows-directory.zip');
} else {
  const spare = join(root, outputDir, `relic-of-the-past-${suffix}-Portable.zip`);
  if (existsSync(spare)) unlinkSync(spare);
}

// A rename that silently finds nothing is how the AppImage link shipped broken.
const expected = linux ? ['rotp-linux.AppImage'] : full ? ['rotp-windows-payload.exe', 'rotp-windows-directory.zip'] : [];
const missing = expected.filter((name) => !existsSync(join(root, outputDir, name)));
if (missing.length) {
  throw new Error(`Packed, but these expected outputs are missing from ${outputDir}: ${missing.join(', ')}. vpk's own naming probably changed.`);
}

const kind = full ? 'a full release (payload + directory zip + package)' : 'an update-only release (package + delta)';
console.log(`packed ${version}${channel ? ` (${channel})` : ''} as ${kind} into ${outputDir}`);
