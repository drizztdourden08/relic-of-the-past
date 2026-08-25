/* @layer shared-game @kind logic */
/**
 * Lookup into the dialogue-context dataset. Ids are 1-based, matching the
 * editor's entry numbering — see ./context.ts for the convention.
 */
import type { DialogueContext } from './types';
import { dialogueContexts } from './context';

/** What entry `id` is, or null when nothing is known about it. */
const contextFor = (id: number): DialogueContext | null => dialogueContexts.get(id) ?? null;

/** Every entry the dataset has evidence for, in id order. */
const allContexts = (): DialogueContext[] => (
  [...dialogueContexts.values()].sort((a, b) => a.id - b.id)
);

export { contextFor, allContexts };
