/* @layer shared-game @kind logic */
import { isBankChar } from './is-bank-char';

const tableLettersOf = (texts: readonly string[], known: ReadonlySet<string>, capacity: number): string[] => {
  const letters = new Set<string>();
  for (const text of texts) {
    for (const ch of text.normalize('NFC')) {
      if (letters.size >= capacity) return [...letters];
      if (!known.has(ch) && isBankChar(ch)) letters.add(ch);
    }
  }
  return [...letters];
};

export { tableLettersOf };
