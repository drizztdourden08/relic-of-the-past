/* @layer electron-main @kind logic */
const toOptionalBuffer = (data?: ArrayBuffer): Buffer | undefined =>
  data ? Buffer.from(data) : undefined;

export { toOptionalBuffer };
