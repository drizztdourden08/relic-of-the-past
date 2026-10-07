/* @layer sanctuary-site @kind logic */
/**
 * Entry names for a zip: two files with the same name would overwrite each other, so a
 * repeat gets " (2)", " (3)" before its extension. Names compare without case, the way
 * most file systems will unpack them.
 */

const EXTENSION = /(\.[^./\\]+)$/;

const numbered = (name: string, n: number) => {
  const match = EXTENSION.exec(name);
  if (!match || match.index === 0) return `${name} (${n})`;
  return `${name.slice(0, match.index)} (${n})${match[1]}`;
};

const uniqueNames = (names: readonly string[]): string[] => {
  const taken = new Set<string>();
  return names.map((name) => {
    let candidate = name;
    for (let n = 2; taken.has(candidate.toLowerCase()); n += 1) candidate = numbered(name, n);
    taken.add(candidate.toLowerCase());
    return candidate;
  });
};

export { uniqueNames };
