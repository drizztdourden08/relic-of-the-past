/* @layer hub-core @kind logic */
const matchPath = (pattern: string, path: string): Record<string, string> | null => {
  const want = pattern.split('/');
  const got = path.split('/');
  if (want.length !== got.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < want.length; i += 1) {
    const segment = want[i];
    if (segment.startsWith(':')) {
      params[segment.slice(1)] = decodeURIComponent(got[i]);
    } else if (segment !== got[i]) {
      return null;
    }
  }
  return params;
};

export { matchPath };
