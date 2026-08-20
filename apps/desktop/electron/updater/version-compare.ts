/* @layer electron-main @kind logic */
/**
 * Version ordering, on its own so both the feed and the format check can use it without
 * importing each other.
 */

/** Numeric compare on x.y.z; a build with a pre-release suffix sorts below a plain one. */
const compareVersions = (a: string, b: string): number => {
  const parts = (v: string) => v.split('-')[0].split('.').map((n) => parseInt(n, 10) || 0);
  const [pa, pb] = [parts(a), parts(b)];
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  const tag = (v: string) => (v.includes('-') ? 0 : 1);
  return tag(a) - tag(b);
};

export { compareVersions };
