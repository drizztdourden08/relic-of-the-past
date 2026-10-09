/* @layer tooling-scripts @kind logic */

const classify = ({ local, remote, base }) => {
  if (local === remote) return 'same';

  if (base === null || base === undefined) {
    if (local && remote) return 'conflict';
    return local ? 'local-only' : 'remote-only';
  }

  if (local === base) return remote === null ? 'remote-deleted' : 'remote-newer';
  if (remote === base) return local === null ? 'local-deleted' : 'local-newer';

  return 'conflict';
};

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

const summarize = (entries) => {
  const counts = {};
  for (const entry of entries) counts[entry.status] = (counts[entry.status] ?? 0) + 1;
  return counts;
};

export { classify, compareTrees, directionOf, summarize };
