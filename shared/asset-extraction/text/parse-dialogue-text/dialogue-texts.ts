/* @layer shared-asset-extraction @kind logic */
import { parseDialogueText } from './parse-dialogue-text';

const dialogueTexts = (text: string): string[] => parseDialogueText(text).map((l) => l.content);

export { dialogueTexts };
