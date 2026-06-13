/* @layer shared-asset-extraction @kind logic */
/**
 * Parse a stored dialogue.txt dump (the inverse of formatDialogueText) back into
 * structured lines. Each line is "N: <content>"; content never contains a newline
 * (control codes are bracketed, e.g. [Scroll]), so a plain line split is safe.
 */
import type { DialogueLine } from '@shared/types/language';

const LINE_RE = /^(\d+): (.*)$/;

const parseDialogueText = (text: string): DialogueLine[] => {
  const lines: DialogueLine[] = [];
  for (const raw of text.split('\n')) {
    const m = LINE_RE.exec(raw);
    if (m) lines.push({ id: Number(m[1]), content: m[2] });
  }
  return lines;
};

/** Just the content strings, ordered by id — ready to feed back to compressStrings. */
const dialogueTexts = (text: string): string[] => {
  return parseDialogueText(text).map((l) => l.content);
};

export { parseDialogueText, dialogueTexts };
