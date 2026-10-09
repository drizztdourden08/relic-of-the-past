/* @layer shared-game @kind logic */
const alphabetChars = (alphabet: readonly string[]): Set<string> =>
  new Set(alphabet.filter((entry) => entry.length === 1));

export { alphabetChars };
