/* @layer shared-asset-extraction @kind logic */
import type { DialogueLine } from '../../sets-types';
import { LINE_RE } from './parse-dialogue-text.constants';

const parseDialogueText = (text: string): DialogueLine[] => {
  const lines: DialogueLine[] = [];
  for (const raw of text.split('\n')) {
    const [, id, content] = LINE_RE.exec(raw) ?? [];
    if (content !== undefined) lines.push({ id: Number(id), content });
  }
  return lines;
};

export { parseDialogueText };
