/* @layer tooling-scripts @kind logic */
/**
 * Packs a built app tree into a Velopack release: the update package, a delta against
 * the previous release, the release index the app reads, and on a full release the
 * setup and portable builds too.
 *
 *   node scripts/build/pack-velopack.mjs                     routine: package + delta
 *   node scripts/build/pack-velopack.mjs --full              also setup + portable
 *   node scripts/build/pack-velopack.mjs --channel beta      a test channel
 *   node scripts/build/pack-velopack.mjs --pack-dir <dir> --out <dir>
 *
 * The split exists because the setup and the portable zip are each another whole copy
 * of the payload, and neither is read by an update: the app reads the release index
 * and pulls a delta. A routine release is therefore ~137 MB instead of ~418 MB, and a
 * full one is cut when the download on the site should move to a newer version.
 *
 * Expects electron-builder to have produced the app tree first (`--win --dir`).
 *
 * `vpk` is a .NET global tool. If it is missing this fails with the install command
 * rather than a stack trace, because that is the only setup step this needs.
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
// Linux packs an AppImage rather than a setup, and needs a PNG icon rather than an ico.
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

if (linux) {
  // xz over the default gzip. The payload is mostly one enormous binary, which is
  // exactly what a bigger dictionary helps with, and an AppImage is decompressed
  // once per launch rather than per update.
  args.push('--compression', 'xz');
} else {
  // The window shown while installing, which only the Windows setup has. Same artwork
  // as the app's boot splash, so the install and the first launch read as one
  // sequence, and the bar over it is the app's accent rather than Velopack's green.
  args.push('--splashImage', join('build', 'installer-splash.gif'));
  args.push('--splashProgressColor', '#E8A33D');
}

// Notes travel inside the package, which is what lets the update dialog show them
// without a second request to the release API.
if (existsSync(notesPath)) args.push('--releaseNotes', notesPath);
// A channel keeps test builds in their own feed, invisible to anyone on stable.
if (channel) args.push('--channel', channel);
// vpk rejects --noInst and --noPortable together, so the setup (the expensive one to
// build) is skipped by flag and the portable zip is deleted after the fact.
// An AppImage IS the whole artifact, so there is no setup to skip and nothing to
// trim from a routine release.
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
 * vpk names the setup after the pack id and channel.
 *
 * rotp-windows-setup.exe is NOT this file: that name belongs to the small downloader
 * stub, which is what the site links and what people actually run. This is the payload
 * the stub fetches and runs silently, so it is named for that job and nobody is
 * expected to download it by hand.
 *
 * The zip is likewise no longer offered as a download. It stays because an install
 * into a chosen directory is done by unzipping it, which the per-user setup cannot do.
 *
 * Updates go through the .nupkg named in the release index, left exactly as vpk wrote it.
 */
const rename = (from, to) => {
  const source = join(root, outputDir, from);
  if (existsSync(source)) renameSync(source, join(root, outputDir, to));
};

const suffix = channel ?? (linux ? 'linux' : 'win');
if (linux) {
  // vpk puts the channel in the Windows setup filename but not in the AppImage's, so
  // both spellings are tried. Renaming the wrong one silently left the release with an
  // AppImage under vpk's own name while every published link pointed at this one.
  rename(`relic-of-the-past-${suffix}.AppImage`, 'rotp-linux.AppImage');
  rename('relic-of-the-past.AppImage', 'rotp-linux.AppImage');
} else if (full) {
  rename(`relic-of-the-past-${suffix}-Setup.exe`, 'rotp-windows-payload.exe');
  rename(`relic-of-the-past-${suffix}-Portable.zip`, 'rotp-windows-directory.zip');
} else {
  const spare = join(root, outputDir, `relic-of-the-past-${suffix}-Portable.zip`);
  if (existsSync(spare)) unlinkSync(spare);
}

// A rename that quietly finds nothing is how the AppImage link shipped broken, so the
// files the release body advertises are asserted rather than assumed.
const expected = linux ? ['rotp-linux.AppImage'] : full ? ['rotp-windows-payload.exe', 'rotp-windows-directory.zip'] : [];
const missing = expected.filter((name) => !existsSync(join(root, outputDir, name)));
if (missing.length) {
  throw new Error(`Packed, but these expected outputs are missing from ${outputDir}: ${missing.join(', ')}. vpk's own naming probably changed.`);
}

const kind = full ? 'a full release (payload + directory zip + package)' : 'an update-only release (package + delta)';
console.log(`packed ${version}${channel ? ` (${channel})` : ''} as ${kind} into ${outputDir}`);
