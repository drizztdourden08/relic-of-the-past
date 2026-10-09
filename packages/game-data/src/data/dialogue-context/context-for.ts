/* @layer shared-game @kind logic */
import type { DialogueContext } from './dialogue-context.type';
import { dialogueContexts } from './context';

const contextFor = (id: number): DialogueContext | null => dialogueContexts.get(id) ?? null;

export { contextFor };
