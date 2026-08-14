/* @layer tooling-scripts @kind logic */
/**
 * The whole sync decision: local vs remote vs the base recorded by the last
 * successful sync.
 *
 * Two sides alone cannot tell "added here" from "deleted there" — both look like
 * "present on one side only". The base is what disambiguates them, which is the
 * same reason git keeps a merge base rather than diffing two trees. Without it
 * every deletion would be undone by the next sync, forever.
 *
 * A file that changed on BOTH sides since the base is a conflict, and a conflict
 * is never resolved automatically: the two versions are both someone's work, and
 * picking one silently is how work disappears.
 */

/** Every state a path can be in. `same` covers "absent on both sides" too. */
const classify = ({ local, remote, base }) => {
  if (local === remote) return 'same';

  // Never recorded before. Present on one side only is unambiguous — it is new
  // there. Present on both with different content is a genuine collision.
  if (base === null || base === undefined) {
    if (local && remote) return 'conflict';
    return local ? 'local-only' : 'remote-only';
  }

  // One side still matches the base, so the other side holds the only edit.
  if (local === base) return remote === null ? 'remote-deleted' : 'remote-newer';
  if (remote === base) return local === null ? 'local-deleted' : 'local-newer';

  return 'conflict';
};

/** Which way a status moves, or null when nothing should be written. */
const DIRECTIONS = {
  'same': null,
  'conflict': null,
  'local-only': 'push',
  'local-newer': 'push',
  'local-deleted': 'push',
  'remote-only': 'pull',
  'remote-newer': 'pull',
  'remote-deleted': 'pull',
};

const directionOf = (status) => DIRECTIONS[status] ?? null;

/**
 * Compare two indexes against a base, returning one entry per path either side
 * knows about, sorted so output is stable between runs.
 */
const compareTrees = ({ local, remote, base }) => {
  const paths = [...new Set([...Object.keys(local), ...Object.keys(remote), ...Object.keys(base)])].sort();

  return paths.map(path => {
    const entry = {
      path,
      local: local[path] ?? null,
      remote: remote[path] ?? null,
      base: base[path] ?? null,
    };
    const status = classify(entry);
    return { ...entry, status, direction: directionOf(status) };
  }).filter(entry => entry.status !== 'same');
};

/** Group entries by status, for reporting. */
const summarize = (entries) => {
  const counts = {};
  for (const entry of entries) counts[entry.status] = (counts[entry.status] ?? 0) + 1;
  return counts;
};

export { classify, compareTrees, directionOf, summarize };
