/* @layer hub-core @kind logic */
const matchPath = (pattern: string, path: string): Record<string, string> | null => {
  const want = pattern.split('/');
  const got = path.split('/');
  if (want.length !== got.length) return null;
  const params: Record<string, string> = {};
  for (const [i, segment] of want.entries()) {
    const actual = got[i] ?? '';
    if (segment.startsWith(':')) {
      params[segment.slice(1)] = decodeURIComponent(actual);
    } else if (segment !== actual) {
      return null;
    }
  }
  return params;
};

export { matchPath };
