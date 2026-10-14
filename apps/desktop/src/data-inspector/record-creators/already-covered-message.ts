/* @layer renderer-app @kind logic */
const alreadyCoveredMessage = (id: string): string =>
  `${id} already catalogues this game id. Correct that record instead of adding a second.`;

export { alreadyCoveredMessage };
