/* @layer shared-asset-extraction @kind logic */
const decodeLetterList = (bytes: Uint8Array | undefined): string[] =>
  bytes === undefined || bytes.length === 0 ? [] : [...new TextDecoder().decode(bytes)];

export { decodeLetterList };
