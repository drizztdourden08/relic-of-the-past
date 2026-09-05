/* @layer tooling-scripts @kind build */
/**
 * Trigger the GitHub "Release" workflow (workflow_dispatch) from the terminal, with
 * the same params as the UI button. The workflow does the version bump, the
 * "release: vX.Y.Z" commit, the tag and the build; nothing is committed or tagged
 * locally here.
 *
 * Usage (the version can be positional or a flag; a leading "v" is optional):
 *   npm run release -- 0.9.0            # positional
 *   npm run release -- --version 0.9.0  # long flag (also --version=0.9.0)
 *   npm run release -- -v 0.9.0         # short flag (also -v0.9.0 / --v0.9.0)
 *   npm run release -- 0.9.0 --latest   # publish immediately as the latest release
 *   npm run release:last                # highest release-notes/v*.md, published as latest
 *   npm run release -- --last           # highest release-notes/v*.md (add --latest to publish)
 *
 * Preconditions (also enforced server-side by the workflow):
 *   - release-notes/v<version>.md exists and is committed/pushed to master
 *   - the v<version> tag does not already exist
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';

const WORKFLOW = 'release.yml';
const REF = 'master';

const parseArgs = (argv) => {
  const rest = argv.slice(2);
  let version;
  let setLatest = false;

  let last = false;

  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === '--latest') {
      setLatest = true;
    } else if (arg === '--last') {
      last = true;
    } else if (/^--?(?:v|version)=/.test(arg)) {
      version = arg.split('=')[1]; // --version=0.9.0 / --v=0.9.0 / -v=0.9.0
    } else if (/^--?(?:v|version)$/.test(arg)) {
      version = rest[(i += 1)]; // --version 0.9.0 / --v 0.9.0 / -v 0.9.0
    } else if (/^--?v(\d.*)$/.test(arg)) {
      version = arg.match(/^--?v(\d.*)$/)[1]; // glued: -v0.9.0 / --v0.9.0
    } else if (!arg.startsWith('-') && version === undefined) {
      version = arg; // positional
    }
  }

  return { version, setLatest, last };
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
  return files[0].replace(/\.md$/, ''); // e.g. "v0.9.0"
};

const fail = (message) => {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
};

const run = () => {
  const { version: explicitVersion, setLatest, last } = parseArgs(process.argv);
  const version = last ? highestNotesVersion() : explicitVersion;

  if (!version) {
    fail('Missing version. Examples: npm run release -- 0.9.0   |   npm run release -- --version 0.9.0 [--latest]   |   npm run release:last');
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

  console.log(`Dispatching Release workflow → ${tag}${setLatest ? ' (publish as latest)' : ' (draft)'}\n`);

  execFileSync(
    'gh',
    [
      'workflow', 'run', WORKFLOW,
      '--ref', REF,
      '-f', `version=${tag}`,
      '-f', `set_latest=${setLatest}`,
    ],
    { stdio: 'inherit' },
  );

  console.log('\nQueued. Watch it with:  gh run watch  (or: gh run list --workflow=release.yml)');
};

run();
