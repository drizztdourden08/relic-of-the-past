/* @layer tooling-scripts @kind build */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';

const WORKFLOW = 'release.yml';
const REF = 'master';

const SWITCHES = {
  '--latest': 'setLatest',
  '--prerelease': 'prerelease',
  '--pre': 'prerelease',
  '--full': 'fullInstaller',
  '--full-installer': 'fullInstaller',
  '--last': 'last',
};

const versionFrom = (arg, next, current) => {
  if (/^--?(?:v|version)=/.test(arg)) return { version: arg.split('=')[1], consumed: 0 };
  if (/^--?(?:v|version)$/.test(arg)) return { version: next, consumed: 1 };
  const inline = arg.match(/^--?v(\d.*)$/);
  if (inline) return { version: inline[1], consumed: 0 };
  if (!arg.startsWith('-') && current === undefined) return { version: arg, consumed: 0 };
  return { version: current, consumed: 0 };
};

const parseArgs = (argv) => {
  const rest = argv.slice(2);
  const flags = { setLatest: false, prerelease: false, fullInstaller: false, last: false };
  let version;

  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    const flagName = Object.hasOwn(SWITCHES, arg) ? SWITCHES[arg] : null;
    if (flagName) {
      flags[flagName] = true;
      continue;
    }
    const parsed = versionFrom(arg, rest[i + 1], version);
    version = parsed.version;
    i += parsed.consumed;
  }

  return { version, ...flags };
};

const highestNotesVersion = () => {
  const files = readdirSync('release-notes').filter((f) => /^v\d+\.\d+\.\d+\.md$/.test(f));
  if (!files.length) {
    fail('No release-notes/v*.md files found to pick a version from.');
  }
  const parts = (f) => f.replace(/^v|\.md$/g, '').split('.').map(Number);
  files.sort((a, b) => {
    const [aMaj, aMin, aPatch] = parts(a);
    const [bMaj, bMin, bPatch] = parts(b);
    return bMaj - aMaj || bMin - aMin || bPatch - aPatch;
  });
  return files[0].replace(/\.md$/, '');
};

const fail = (message) => {
  console.error(`\nerror: ${message}\n`);
  process.exit(1);
};

const publishMode = ({ setLatest, prerelease }) => {
  if (prerelease) return 'pre-release';
  return setLatest ? 'publish as latest' : 'draft';
};

const modeLabel = ({ setLatest, prerelease, fullInstaller }) => {
  const mode = publishMode({ setLatest, prerelease });
  return fullInstaller ? `${mode}, full installer` : mode;
};

const run = () => {
  const { version: explicitVersion, setLatest, prerelease, fullInstaller, last } = parseArgs(process.argv);
  const version = last ? highestNotesVersion() : explicitVersion;

  if (!version) {
    fail('Missing version. Examples: pnpm release 0.9.0   |   pnpm release 0.9.0 --prerelease   |   pnpm release:last');
  }

  if (setLatest && prerelease) {
    fail('--latest and --prerelease are mutually exclusive. A pre-release never becomes the latest download.');
  }

  const tag = `v${version.replace(/^v/, '')}`;
  const notes = `release-notes/${tag}.md`;

  if (!existsSync(notes)) {
    fail(`Missing ${notes}. Create and commit the release notes first. The release body comes from them.`);
  }

  const tagExists = spawnSync('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`]).status === 0;
  if (tagExists) {
    fail(`Tag ${tag} already exists. Pick a new version.`);
  }

  console.log(`Dispatching Release workflow -> ${tag} (${modeLabel({ setLatest, prerelease, fullInstaller })})\n`);

  execFileSync(
    'gh',
    [
      'workflow', 'run', WORKFLOW,
      '--ref', REF,
      '-f', `version=${tag}`,
      '-f', `set_latest=${setLatest}`,
      '-f', `prerelease=${prerelease}`,
      '-f', `full_installer=${fullInstaller}`,
    ],
    { stdio: 'inherit' },
  );

  console.log('\nQueued. Watch it with:  gh run watch  (or: gh run list --workflow=release.yml)');
};

run();
