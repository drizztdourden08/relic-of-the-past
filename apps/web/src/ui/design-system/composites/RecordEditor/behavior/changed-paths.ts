/* @layer renderer-components @kind logic */
/**
 * Turns a list of changed LEAF paths into the set of paths the form can mark.
 *
 * A caller reports where two records actually differ, which is always a leaf —
 * `gameId.roomIndex`, `tags[2]`. The form, though, renders containers too, and a
 * nested row that showed nothing while one of its children had moved would hide
 * the change behind a fold. So every ancestor of a changed leaf is marked as
 * well, computed once rather than by re-scanning the list per row.
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
