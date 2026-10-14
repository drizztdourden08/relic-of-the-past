/* @layer renderer-lib @kind logic */
const lastPathSegment = (url: string): string => {
  try {
    return new URL(url).pathname.split('/').pop() ?? '';
  } catch {
    return '';
  }
};

export { lastPathSegment };
