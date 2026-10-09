/* @layer renderer-components @kind logic */
const listedNames = (names: readonly string[]): string =>
  names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

export { listedNames };
