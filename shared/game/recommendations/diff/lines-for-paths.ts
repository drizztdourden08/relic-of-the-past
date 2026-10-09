/* @layer shared-game @kind logic */
import { pathLines } from '../path-lines';

const parentPathOf = (path: string): string => {
  const cut = Math.max(path.lastIndexOf('.'), path.lastIndexOf('['));
  return cut <= 0 ? '' : path.slice(0, cut);
};

const linesForPaths = (source: string, paths: readonly string[]): readonly number[] => {
  const declared = pathLines(source);
  const found = new Set<number>();

  for (const path of paths) {
    let probe = path;
    while (probe) {
      const line = declared.get(probe);
      if (line !== undefined) { found.add(line); break; }
      probe = parentPathOf(probe);
    }
  }

  return [...found].sort((a, b) => a - b);
};

export { linesForPaths };
