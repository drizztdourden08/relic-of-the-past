/* @layer shared-game @kind logic */
/**
 * Dialogue entries a translator must never edit, keyed by `DialogueEntry.id`
 * (1-based, matching the game's own positional index, as in `types.ts`).
 *
 * Ids 2, 3 / 7, 8, 9 / 10, 11 / 12, 13 are the two- and three-option choice
 * cursor frames: each contains only control codes, spaces and a `>` cursor,
 * and every choice prompt in the game reuses them. Id 5 is `EXTRA_STRING`,
 * the synthetic control string the extraction pipeline injects at index 4
 * to pad a 396-string ROM dump up to the canonical 397
 * (`shared/asset-extraction/text/build-language-entry.ts`). It never
 * existed as translatable prose.
 */
type StructuralEntry = { id: number; reason: string };

const kChoiceFrameReason = 'choice-prompt cursor frame: control codes, spaces and a > cursor only. Editing it breaks every choice prompt in the game';

const STRUCTURAL_ENTRIES: StructuralEntry[] = [
  { id: 2, reason: kChoiceFrameReason },
  { id: 3, reason: kChoiceFrameReason },
  { id: 5, reason: 'synthetic control string injected by the extraction pipeline to pad the dialogue count; not translatable prose' },
  { id: 7, reason: kChoiceFrameReason },
  { id: 8, reason: kChoiceFrameReason },
  { id: 9, reason: kChoiceFrameReason },
  { id: 10, reason: kChoiceFrameReason },
  { id: 11, reason: kChoiceFrameReason },
  { id: 12, reason: kChoiceFrameReason },
  { id: 13, reason: kChoiceFrameReason },
];

const STRUCTURAL_BY_ID = new Map(STRUCTURAL_ENTRIES.map((entry) => [entry.id, entry]));

const STRUCTURAL_IDS: ReadonlySet<number> = new Set(STRUCTURAL_BY_ID.keys());

const structuralEntry = (id: number): StructuralEntry | null => STRUCTURAL_BY_ID.get(id) ?? null;

export { structuralEntry, STRUCTURAL_IDS };
export type { StructuralEntry };
