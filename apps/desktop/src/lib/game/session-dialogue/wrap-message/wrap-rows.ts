/* @layer bridge-wasm @kind logic */
import { balanceRows, isHighlightMarker, stripHighlight } from '@shared/randomizer/receipt-text/highlight-markup';
import { FALLBACK_WIDTH_PX, LETTER_OR_DIGIT, LINE_WIDTH_PX } from './wrap-message.constants';

const pixelWidthOf = (word: string, alphabet: readonly string[], widths: Uint8Array): number => {
  let px = 0;
  for (const ch of word) {
    if (isHighlightMarker(ch)) continue;
    const index = alphabet.indexOf(ch);
    px += index >= 0 && index < widths.length ? widths[index] : FALLBACK_WIDTH_PX;
  }
  return px;
};

const isLoneSymbol = (word: string): boolean => {
  const bare = stripHighlight(word);
  return bare !== '' && !LETTER_OR_DIGIT.test(bare);
};

const wrapUnits = (text: string): string[] => {
  const words = text.split(' ');
  const units: string[] = [];
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    if (isLoneSymbol(word) && units.length > 0 && i + 1 < words.length) {
      units[units.length - 1] += ` ${word} ${words[i + 1]}`;
      i += 1;
      continue;
    }
    units.push(word);
  }
  return units;
};

const wrapRows = (text: string, alphabet: readonly string[], widths: Uint8Array): string[] => {
  const spacePx = pixelWidthOf(' ', alphabet, widths);
  const rows: string[] = [];
  let row = '';
  let rowPx = 0;
  for (const word of wrapUnits(text)) {
    const wordPx = pixelWidthOf(word, alphabet, widths);
    if (row !== '' && rowPx + spacePx + wordPx > LINE_WIDTH_PX) {
      rows.push(row);
      row = word;
      rowPx = wordPx;
      continue;
    }
    rowPx += row === '' ? wordPx : spacePx + wordPx;
    row = row === '' ? word : `${row} ${word}`;
  }
  if (row !== '') rows.push(row);
  return balanceRows(rows);
};

export { wrapRows };
