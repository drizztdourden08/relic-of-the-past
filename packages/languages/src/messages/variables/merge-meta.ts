/* @layer shared-game @kind logic */
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
    return match?.kind === variable.kind ? kept(variable, match) : variable;
  });
};

export { mergeVariableMeta };
