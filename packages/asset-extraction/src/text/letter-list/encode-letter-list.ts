/* @layer shared-asset-extraction @kind logic */
const encodeLetterList = (letters: readonly string[]): Buffer => Buffer.from(letters.join(''), 'utf8');

export { encodeLetterList };
