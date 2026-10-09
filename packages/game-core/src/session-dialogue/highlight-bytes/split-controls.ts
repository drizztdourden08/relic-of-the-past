/* @layer bridge-wasm @kind logic */
import { extraSlotOfToken } from '@rotp/game-data';
import { HIGHLIGHT_KIND } from '../../receipt-text/highlight-markup';
import { extraGlyphBytes } from './extra-glyph-bytes';
import { highlightBytes } from './highlight-bytes';
import type { ControlSplit } from './highlight-bytes.type';

const controlBytesOf = (ch: string, code: string): number[] | undefined => {
  const kind = HIGHLIGHT_KIND.get(ch);
  if (kind !== undefined) return highlightBytes(kind, code);
  const slot = extraSlotOfToken(ch);
  return slot === undefined ? undefined : extraGlyphBytes(slot, code);
};

const splitControls = (text: string, code: string): ControlSplit => {
  const runs: string[] = [''];
  const controls: number[][] = [];
  for (const ch of text) {
    const bytes = controlBytesOf(ch, code);
    if (bytes === undefined) runs[runs.length - 1] += ch;
    else { controls.push(bytes); runs.push(''); }
  }
  return { runs, controls };
};

export { splitControls };
