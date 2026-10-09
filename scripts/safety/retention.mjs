/* @layer tooling-scripts @kind logic */
import { execFileSync } from 'node:child_process';
import { repoRoot } from '../parallel/paths.mjs';
import { KEEP_DAYS, KEEP_MIN, SAFETY_NAMESPACE } from './roots.mjs';

const git = (args) => execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' });

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

const selectExpired = (snapshots, { keepMin = KEEP_MIN, keepDays = KEEP_DAYS } = {}) => {
  const kept = snapshots.slice(0, keepMin);
  const rest = snapshots.slice(keepMin);
  return {
    keep: [...kept, ...rest.filter((s) => s.ageDays <= keepDays)],
    expire: rest.filter((s) => s.ageDays > keepDays),
  };
};

const pruneSnapshots = (options) => {
  const { expire } = selectExpired(listSnapshots(), options);
  for (const snap of expire) git(['update-ref', '-d', snap.ref]);
  return expire.map((s) => s.ref);
};

export { listSnapshots, pruneSnapshots, selectExpired };
