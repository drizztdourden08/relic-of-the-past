/* @layer shared-asset-extraction @kind logic */
const wordsToBuffer = (words: Uint16Array): Buffer => {
  const result = Buffer.alloc(words.length * 2);
  for (const [i, word] of words.entries()) result.writeUInt16LE(word, i * 2);
  return result;
};

export { wordsToBuffer };
