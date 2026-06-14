/* @layer tooling-scripts @kind build */
/**
 * Trigger the GitHub "Release" workflow (workflow_dispatch) from the terminal, so
 * a local release uses the EXACT same path and params as the GitHub UI button:
 * a version and an optional "publish as latest" flag.
 *
 * The workflow itself does the version bump, the "release: vX.Y.Z" commit on
 * master, the tag, and the build — nothing is committed or tagged locally here.
 *
 * Usage:
 *   npm run release -- 0.9.0            # build a draft release
 *   npm run release -- 0.9.0 --latest   # publish immediately as the latest release
 *   npm run release -- v0.9.0           # leading "v" is accepted too
 *
 * Preconditions (also enforced server-side by the workflow):
 *   - release-notes/v<version>.md exists and is committed/pushed to master
 *   - the v<version> tag does not already exist
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const WORKFLOW = 'release.yml';
const REF = 'master';

const parseArgs = (argv) => {
  const rest = argv.slice(2);
  const setLatest = rest.includes('--latest');
  const version = rest.find((a) => !a.startsWith('-'));
  return { version, setLatest };
};

const fail = (message) => {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
};

const run = () => {
  const { version, setLatest } = parseArgs(process.argv);

  if (!version) {
    fail('Missing version. Example: npm run release -- 0.9.0 [--latest]');
  }

  const tag = `v${version.replace(/^v/, '')}`;
  const notes = `release-notes/${tag}.md`;

  if (!existsSync(notes)) {
    fail(`Missing ${notes}. Create and commit the release notes first — they are the source of truth for the release body.`);
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
