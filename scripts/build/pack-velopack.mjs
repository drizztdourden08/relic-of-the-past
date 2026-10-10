/* @layer tooling-scripts @kind logic */
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
const linux = process.argv.includes('--linux');
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
    ? join('apps', 'desktop', 'public', 'logos', 'logo-256.png')
    : join('apps', 'desktop', 'public', 'logos', 'icon.ico'),
  '--outputDir', outputDir,
];

if (!linux) {
  args.push('--splashImage', join('build', 'installer-splash.gif'));
  args.push('--splashProgressColor', '#E8A33D');
}

if (existsSync(notesPath)) args.push('--releaseNotes', notesPath);
if (channel) args.push('--channel', channel);
if (!full && !linux) args.push('--noInst');

const vpkCommand = () => {
  const local = join(homedir(), '.dotnet', 'tools', 'vpk.exe');
  return existsSync(local) ? local : 'vpk';
};

try {
  execFileSync(vpkCommand(), args, { stdio: 'inherit', cwd: root });
} catch (err) {
  if (err.code === 'ENOENT') {
    throw new Error('vpk is not installed. Run: dotnet tool install -g vpk --version 1.2.110-ge826545', { cause: err });
  }
  throw err;
}

const rename = (from, to) => {
  const source = join(root, outputDir, from);
  if (existsSync(source)) renameSync(source, join(root, outputDir, to));
};

const suffix = channel ?? (linux ? 'linux' : 'win');
if (linux) {
  rename(`relic-of-the-past-${suffix}.AppImage`, 'rotp-linux.AppImage');
  rename('relic-of-the-past.AppImage', 'rotp-linux.AppImage');
} else if (full) {
  rename(`relic-of-the-past-${suffix}-Setup.exe`, 'rotp-windows-payload.exe');
  rename(`relic-of-the-past-${suffix}-Portable.zip`, 'rotp-windows-directory.zip');
} else {
  const spare = join(root, outputDir, `relic-of-the-past-${suffix}-Portable.zip`);
  if (existsSync(spare)) unlinkSync(spare);
}

const expectedOutputs = () => {
  if (linux) return ['rotp-linux.AppImage'];
  if (full) return ['rotp-windows-payload.exe', 'rotp-windows-directory.zip'];
  return [];
};

const expected = expectedOutputs();
const missing = expected.filter((name) => !existsSync(join(root, outputDir, name)));
if (missing.length) {
  throw new Error(`Packed, but these expected outputs are missing from ${outputDir}: ${missing.join(', ')}. vpk's own naming probably changed.`);
}

const kind = full ? 'a full release (payload + directory zip + package)' : 'an update-only release (package + delta)';
console.log(`packed ${version}${channel ? ` (${channel})` : ''} as ${kind} into ${outputDir}`);
