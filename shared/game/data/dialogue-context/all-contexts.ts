/* @layer shared-game @kind logic */
import type { DialogueContext } from './dialogue-context.type';
import { dialogueContexts } from './context';

const allContexts = (): DialogueContext[] => (
  [...dialogueContexts.values()].sort((a, b) => a.id - b.id)
);

export { allContexts };
