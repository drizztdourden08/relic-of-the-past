/* @layer renderer-components @kind logic */
/**
 * Turns changed leaf paths into the set of paths the form marks. Every
 * ancestor of a changed leaf is marked too, or a fold would hide the change.
 */
const ancestorsOf = (path: string, into: Set<string>): void => {
  let probe = path;
  while (probe) {
    into.add(probe);
    const cut = Math.max(probe.lastIndexOf('.'), probe.lastIndexOf('['));
    probe = cut <= 0 ? '' : probe.slice(0, cut);
  }
};

/** Every marked path: each leaf, plus every container on the way down to it. */
const markedPaths = (paths: readonly string[]): ReadonlySet<string> => {
  const marked = new Set<string>();
  for (const path of paths) ancestorsOf(path, marked);
  return marked;
};

export { markedPaths };
