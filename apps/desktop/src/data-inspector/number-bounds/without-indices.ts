/* @layer renderer-app @kind logic */
const withoutIndices = (path: string): string =>
  path.split('.').map(segment => (/^\d+$/.test(segment) ? '[]' : segment)).join('.')
    .replace(/\.\[\]/g, '[]');

export { withoutIndices };
