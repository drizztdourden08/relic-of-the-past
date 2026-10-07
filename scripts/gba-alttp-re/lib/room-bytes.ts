/* @layer scripts @kind tooling */
/** The native byte layouts the export writes per room: map words, entity and secret lists. */

const wordsToBuffer = (words: Uint16Array): Buffer => {
  const result = Buffer.alloc(words.length * 2);
  for (let i = 0; i < words.length; i++) result.writeUInt16LE(words[i], i * 2);
  return result;
};

const entityBytes = (sortMode: number, records: readonly { nativeBytes: Uint8Array }[]): Buffer => Buffer.concat([
  Buffer.from([sortMode]),
  ...records.map(record => Buffer.from(record.nativeBytes)),
  Buffer.from([0xff]),
]);

const secretBytes = (records: readonly { nativeBytes: Uint8Array }[]): Buffer => Buffer.concat([
  ...records.map(record => Buffer.from(record.nativeBytes)),
  Buffer.from([0xff, 0xff]),
]);

export { entityBytes, secretBytes, wordsToBuffer };
