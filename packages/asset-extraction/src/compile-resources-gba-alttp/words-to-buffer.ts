/* @layer shared-asset-extraction @kind logic */
const wordsToBuffer = (words: Uint16Array): Buffer => {
  const result = Buffer.alloc(words.length * 2);
  for (let i = 0; i < words.length; i++) result.writeUInt16LE(words[i], i * 2);
  return result;
};

export { wordsToBuffer };
