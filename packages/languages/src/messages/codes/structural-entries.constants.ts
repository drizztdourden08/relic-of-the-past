/* @layer shared-game @kind constants */
import type { StructuralEntry } from './code-catalog.type';

const CHOICE_FRAME_REASON = 'choice-prompt cursor frame: control codes, spaces and a > cursor only. Editing it breaks every choice prompt in the game';

const STRUCTURAL_ENTRIES: StructuralEntry[] = [
  { id: 2, reason: CHOICE_FRAME_REASON },
  { id: 3, reason: CHOICE_FRAME_REASON },
  { id: 5, reason: 'synthetic control string injected by the extraction pipeline to pad the dialogue count; not translatable prose' },
  { id: 7, reason: CHOICE_FRAME_REASON },
  { id: 8, reason: CHOICE_FRAME_REASON },
  { id: 9, reason: CHOICE_FRAME_REASON },
  { id: 10, reason: CHOICE_FRAME_REASON },
  { id: 11, reason: CHOICE_FRAME_REASON },
  { id: 12, reason: CHOICE_FRAME_REASON },
  { id: 13, reason: CHOICE_FRAME_REASON },
];

const STRUCTURAL_BY_ID = new Map(STRUCTURAL_ENTRIES.map((entry) => [entry.id, entry]));

export { STRUCTURAL_BY_ID };
