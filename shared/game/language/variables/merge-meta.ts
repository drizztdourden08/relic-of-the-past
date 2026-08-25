/* @layer shared-game @kind logic */
/**
 * Carry the fields the legacy pair has no room for across a rebuild.
 *
 * A set is still edited through its projected glossary and name table, so the
 * variable list is rebuilt from that pair whenever the set is saved. That
 * rebuild regenerates `label` from the value and cannot know about a note the
 * translator attached to a menu name, so both would be lost on every save.
 * Merging the previous list back in keeps them.
 *
 * Values, kinds, lock state and widths deliberately come from the REBUILD, not
 * from the previous list: those follow the text, and the text is what was just
 * edited. Only presentation is carried over, and only for a key that still
 * exists with the same kind.
 */
import type { Variable } from './types';

const kept = (next: Variable, previous: Variable): Variable => ({
  ...next,
  label: previous.label,
  ...(next.note === undefined && previous.note !== undefined ? { note: previous.note } : {}),
});

const mergeVariableMeta = (next: Variable[], previous: Variable[] | undefined): Variable[] => {
  if (!previous || previous.length === 0) return next;
  const before = new Map(previous.map((variable) => [variable.key, variable]));

  return next.map((variable) => {
    const match = before.get(variable.key);
    return match && match.kind === variable.kind ? kept(variable, match) : variable;
  });
};

export { mergeVariableMeta };
