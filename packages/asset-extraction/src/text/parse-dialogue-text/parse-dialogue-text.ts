/* @layer shared-asset-extraction @kind logic */
import type { DialogueLine } from '../../sets-types';
import { LINE_RE } from './parse-dialogue-text.constants';

const parseDialogueText = (text: string): DialogueLine[] => {
  const lines: DialogueLine[] = [];
  for (const raw of text.split('\n')) {
    const m = LINE_RE.exec(raw);
    if (m) lines.push({ id: Number(m[1]), content: m[2] });
  }
  return lines;
};

export { parseDialogueText };
