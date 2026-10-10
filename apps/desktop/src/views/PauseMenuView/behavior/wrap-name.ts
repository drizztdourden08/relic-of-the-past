/* @layer renderer-hud @kind logic */
import { NAME_PANEL_GRID } from '../PauseMenuView.constants';
import type { NameGrid } from '../PauseMenuView.type';
import { foldToGlyphs } from './fold-to-glyphs';
import { nameColumns } from './name-columns';

const hardBreak = (word: string, maxLines: number): string[] => {
  const chars = [...word];
  const size = Math.ceil(chars.length / maxLines);
  const lines: string[] = [];
  for (let at = 0; at < chars.length && lines.length < maxLines; at += size) {
    const isLast = lines.length === maxLines - 1;
    lines.push(chars.slice(at, isLast ? chars.length : at + size).join(''));
  }
  return lines;
};

const wrapWords = (words: string[], grid: NameGrid): string[] => {
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (!line) { line = word; continue; }
    const candidate = `${line} ${word}`;
    const isLastLine = lines.length === grid.maxLines - 1;
    if (isLastLine || nameColumns(candidate) <= grid.maxCols) { line = candidate; continue; }
    lines.push(line);
    line = word;
  }
  lines.push(line);
  return lines;
};

const wrapName = (text: string, grid: NameGrid = NAME_PANEL_GRID): string[] => {
  const folded = foldToGlyphs(text);
  if (!folded) return [''];
  const words = folded.split(' ');
  if (words.length === 1 && nameColumns(folded) > grid.maxCols * grid.maxLines) {
    return hardBreak(folded, grid.maxLines);
  }
  return wrapWords(words, grid);
};

export { wrapName };
