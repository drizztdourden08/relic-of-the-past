/* @layer tooling-scripts @kind logic */
/**
 * Keeping the snapshot branches from piling up, without ever pruning to nothing.
 *
 * Two rules, and the second always wins: drop anything older than KEEP_DAYS, but keep at
 * least KEEP_MIN regardless of age. A run of operations in one sitting must not be able
 * to age out the snapshot taken before that sitting started, which is the one you would
 * actually want when something went wrong an hour ago.
 *
 * Deletion is `update-ref -d`, which names the exact ref and cannot be talked into
 * touching something that merely looks similar. (`branch -D` would not work here anyway:
 * these refs deliberately do not live under refs/heads.)
 */
import { execFileSync } from 'node:child_process';
import { repoRoot } from '../parallel/paths.mjs';
import { KEEP_DAYS, KEEP_MIN, SAFETY_NAMESPACE } from './roots.mjs';

const git = (args) => execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' });

/** Every snapshot, newest first, with the age the retention rules judge. */
const listSnapshots = () => {
  const out = git([
    'for-each-ref',
    '--sort=-committerdate',
    '--format=%(refname)%09%(committerdate:unix)%09%(objectname:short)',
    `${SAFETY_NAMESPACE}/`,
  ]);
  const now = Date.now();
  return out.split('\n').filter(Boolean).map((line) => {
    const [ref, unix, sha] = line.split('\t');
    const at = Number(unix) * 1000;
    const name = ref.slice(`${SAFETY_NAMESPACE}/`.length);
    return { ref, name, sha, at, ageDays: (now - at) / 86_400_000 };
  });
};

/**
 * Which snapshots the rules would remove. Split out from the deleting so the CLI can
 * show the decision before acting, and so it is testable without side effects.
 */
const selectExpired = (snapshots, { keepMin = KEEP_MIN, keepDays = KEEP_DAYS } = {}) => {
  const kept = snapshots.slice(0, keepMin);
  const rest = snapshots.slice(keepMin);
  return {
    keep: [...kept, ...rest.filter((s) => s.ageDays <= keepDays)],
    expire: rest.filter((s) => s.ageDays > keepDays),
  };
};

/** Apply the rules. Returns the refs removed. */
const pruneSnapshots = (options) => {
  const { expire } = selectExpired(listSnapshots(), options);
  for (const snap of expire) git(['update-ref', '-d', snap.ref]);
  return expire.map((s) => s.ref);
};

export { listSnapshots, pruneSnapshots, selectExpired };
