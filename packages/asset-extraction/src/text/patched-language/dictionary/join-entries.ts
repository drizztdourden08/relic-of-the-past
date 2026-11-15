/* @layer shared-asset-extraction @kind logic */
const joinEntries = (entries: readonly Uint8Array[]): Buffer => Buffer.concat(entries.map((entry) => Buffer.from(entry)));

export { joinEntries };
