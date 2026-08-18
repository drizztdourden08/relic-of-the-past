/* @layer tooling-scripts @kind logic */
/**
 * Two-way sync between this repository and the private companion repo.
 *
 * The vault is a sibling checkout with one `tree/` folder whose paths mirror
 * this repo's, so the path IS the mapping and there is no manifest to keep in
 * step. Both sides are indexed by content and compared against the base recorded
 * by the last successful sync, exactly as `git fetch` compares against a merge
 * base — see compare.mjs for the decision table.
 *
 * Everything the vault provides is ADDITIVE: without it the app builds, lints
 * and passes its unit tests, with an empty dataset and the fixture-backed suites
 * skipped. So this NEVER fails a build. No vault, no state, no access: one line
 * and exit 0. That is a normal state, not an error.
 *
 *   node scripts/vault/sync.mjs               apply every unambiguous change, both ways
 *   node scripts/vault/sync.mjs --status      report and write nothing
 *   node scripts/vault/sync.mjs --force-pull  the vault wins everywhere
 *   node scripts/vault/sync.mjs --force-push  this checkout wins everywhere
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ROOT, MANAGED_ROOTS, locateVault, treeDirOf } from './locate.mjs';
import { indexTree, indexPaths } from './tree-index.mjs';
import { compareTrees, summarize } from './compare.mjs';
import { applyEntries, commitVault } from './apply.mjs';
import { createSnapshot } from '../safety/snapshot.mjs';
import { pruneSnapshots } from '../safety/retention.mjs';
import { guardMirroredDeletions, refusalLines } from './removal-guard.mjs';

const STATE_FILE = join(ROOT, '.vault-state.json');

const argv = process.argv.slice(2);
const MODE = argv.includes('--status') ? 'status'
  : argv.includes('--force-pull') ? 'force-pull'
    : argv.includes('--force-push') ? 'force-push'
      : 'sync';

const say = (message) => process.stdout.write(`vault: ${message}\n`);

const readState = () => {
  if (!existsSync(STATE_FILE)) return {};
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8')).files ?? {};
  } catch {
    say('.vault-state.json is unreadable — treating this as a first sync');
    return {};
  }
};

/**
 * Only paths the two sides now AGREE on may become the base.
 *
 * A conflict is deliberately left out. Recording it would make one side match
 * the base on the next run, which reads as "the other side is the only edit" —
 * the conflict would resolve itself silently, in whichever direction happened to
 * be recorded. Left out, it stays a conflict until a person settles it.
 */
const agreedIndex = (local, remote) => {
  const agreed = {};
  for (const [path, hash] of Object.entries(local)) {
    if (remote[path] === hash) agreed[path] = hash;
  }
  return agreed;
};

const writeState = (files, vaultDir) => {
  const state = { syncedAt: Date.now(), vaultDir, files };
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
};

/**
 * Which repo directories to scan for work to send, reduced to their shallowest
 * members so each subtree is walked once.
 *
 * The declared roots cover the bootstrap case (an empty `tree/` still knows
 * where to look); the directories the vault's own files sit in cover the other
 * way round, so a folder added to `tree/` is picked up with no change here.
 */
const managedRoots = (remoteIndex) => {
  const fromVault = Object.keys(remoteIndex).map(path => dirname(path));
  const dirs = [...new Set([...MANAGED_ROOTS, ...fromVault])].sort();
  return dirs.filter(dir => !dirs.some(other => other !== dir && dir.startsWith(`${other}/`)));
};

/** Force modes ignore the base: one side is declared correct and the other is made to match. */
const forced = (entries, winner) => entries.map(entry => {
  const present = winner === 'remote' ? entry.remote : entry.local;
  const status = present
    ? (winner === 'remote' ? 'remote-newer' : 'local-newer')
    : (winner === 'remote' ? 'remote-deleted' : 'local-deleted');
  return { ...entry, status, direction: winner === 'remote' ? 'pull' : 'push' };
});

const report = (entries) => {
  const counts = summarize(entries);
  if (entries.length === 0) {
    say('in sync — nothing to do');
    return;
  }
  for (const [status, count] of Object.entries(counts).sort()) say(`  ${status}: ${count}`);

  const conflicts = entries.filter(entry => entry.status === 'conflict');
  for (const entry of conflicts.slice(0, 10)) say(`  CONFLICT ${entry.path}`);
  if (conflicts.length > 10) say(`  ... and ${conflicts.length - 10} more`);
  if (conflicts.length > 0) {
    say('Conflicts are left untouched. Resolve with --force-pull or --force-push,');
    say('or fix the file on one side so the two agree.');
  }
};

const main = () => {
  const vaultDir = locateVault();
  if (!vaultDir) {
    say('not available — skipping. The build, lint and unit tests do not need it.');
    say('  Expected a checkout at ../rotp-vault, or set ROTP_VAULT_DIR.');
    return;
  }

  const treeDir = treeDirOf(vaultDir);
  const remote = indexTree(treeDir);
  const local = indexPaths(ROOT, managedRoots(remote));
  const base = readState();

  const compared = compareTrees({ local, remote, base });
  const entries = MODE === 'force-pull' ? forced(compared, 'remote')
    : MODE === 'force-push' ? forced(compared, 'local')
      : compared;

  say(`${vaultDir} · ${Object.keys(remote).length} file(s) in tree/`);

  if (MODE === 'status') {
    report(entries);
    return;
  }

  report(entries);

  // Deletions travel in both directions and need DIFFERENT protection, which is easy to
  // get wrong: one local snapshot looks like it covers both and covers only one.
  //
  // `remote-deleted` removes a file from THIS checkout, so a snapshot of local disk taken
  // now holds the way back. `local-deleted` removes it from the VAULT, and there a local
  // snapshot is worthless by definition — the local copy is already gone, which is what
  // made it local-deleted. The last good copy is the vault's own HEAD, so that gets named
  // rather than snapshotted, and a mass deletion is refused outright: preventing the
  // accident beats recovering from it, and 233 files went this way once.
  const guard = guardMirroredDeletions({ entries, vaultDir, mode: MODE });
  if (guard.blocked) {
    // Deliberately exit 0. This runs in postinstall, a refusal means NOTHING was changed
    // on either side, and failing every future `npm install` until someone acts would do
    // more damage than the deletion being declined. The message is the deliverable.
    for (const line of refusalLines(guard)) say(line);
    return;
  }

  const incoming = entries.filter((entry) => entry.status === 'remote-deleted').length;
  if (incoming > 0) {
    const snapshot = createSnapshot('vault-sync');
    say(`safety snapshot ${snapshot.ref} — holds the ${incoming} file(s) about to be removed here`);
    pruneSnapshots();
  }
  if (guard.outgoing.length > 0) {
    const where = guard.head ? `; ${guard.head} still holds them` : '';
    say(`${guard.outgoing.length} file(s) gone locally will be removed from the vault${where}`);
  }

  const applied = applyEntries({ entries, root: ROOT, treeDir });

  if (applied.pulled + applied.pushed + applied.removed > 0) {
    say(`applied — pulled ${applied.pulled}, pushed ${applied.pushed}, removed ${applied.removed}`);
    const committed = commitVault(vaultDir, `chore(tree): sync from the main repository (${MODE})`);
    if (committed) say(`vault committed ${committed} — not pushed, that is yours to send`);
  }

  // Re-read both sides so the base is what is actually on disk now, and record
  // only what the two agree on.
  const settledRemote = indexTree(treeDir);
  const settledLocal = indexPaths(ROOT, managedRoots(settledRemote));
  writeState(agreedIndex(settledLocal, settledRemote), vaultDir);
};

main();
