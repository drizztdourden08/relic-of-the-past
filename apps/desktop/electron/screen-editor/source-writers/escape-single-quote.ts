/* @layer electron-main @kind logic */
const escapeSingleQuote = (s: string): string => s.replace(/'/g, "\\'");

export { escapeSingleQuote };
