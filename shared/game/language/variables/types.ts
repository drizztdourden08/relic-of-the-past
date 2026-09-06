/* @layer shared-game @kind types */
/**
 * One editable substitution list, in place of the two parallel tables a
 * language set used to carry: a glossary of reusable phrases, and a separate
 * name table only the pause menu ever read. They looked alike and
 * could not reach each other: a term could not retitle a menu entry, and a
 * menu entry could not appear in a line. A translator now sees ONE list of
 * everything that varies in shown text, whether it is theirs to change or the
 * game's.
 *
 * `kind` decides both where a value comes from and how it bakes:
 *
 * - `engine`: the running game substitutes this itself, so there is nothing to
 *   translate. Exactly two exist (see `./builtin`). `value` is null and
 *   `locked` is true, but the entry stays insertable: a line may reference it,
 *   and the bake step emits the control code the engine reads.
 * - `term`: a reusable phrase the translator owns. Referenced from a line and
 *   expanded to its literal text at bake time.
 * - `menu-name`: a display string outside dialogue (inventory names, bottle
 *   contents, menu section titles). Same expansion rules as a term, so a name
 *   can now also be dropped into a line.
 */
type VariableKind = 'engine' | 'term' | 'menu-name';

type Variable = {
  /** Unique within a set, and reused verbatim as a token `ref` key. */
  key: string;
  kind: VariableKind;
  /** What a picker shows. */
  label: string;
  /** The literal text, or null when the game owns the value. */
  value: string | null;
  /** The game owns it: editable nowhere, still insertable. */
  locked: boolean;
  /** Worst-case rendered glyph count, for the row-fit maths. */
  maxGlyphs: number;
  note?: string;
};

/** Key to variable, for the O(1) lookups an expansion walk needs. */
type VariableIndex = Map<string, Variable>;

export type { Variable, VariableIndex, VariableKind };
