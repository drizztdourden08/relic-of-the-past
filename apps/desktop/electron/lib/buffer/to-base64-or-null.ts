/* @layer electron-main @kind logic */
const toBase64OrNull = (buf: Buffer | null): string | null =>
  buf ? buf.toString('base64') : null;

export { toBase64OrNull };
