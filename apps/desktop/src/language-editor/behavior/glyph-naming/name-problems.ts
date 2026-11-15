/* @layer renderer-components @kind logic */
import type { GlyphNames } from '../../language-editor.type';
import { NAME_PROBLEMS } from './glyph-naming.constants';
import type { NameCheck } from './glyph-naming.type';

const problemOf = (value: string, check: NameCheck): string | null => {
  if ([...value].length !== 1) return NAME_PROBLEMS.length;
  if (check.taken.has(value)) return NAME_PROBLEMS.taken;
  const uses = Object.values(check.names).filter((other) => other === value).length;
  return uses > 1 ? NAME_PROBLEMS.twice : null;
};

const nameProblems = (check: NameCheck): GlyphNames => {
  const problems: Record<string, string> = {};
  for (const [token, value] of Object.entries(check.names)) {
    const problem = value.length === 0 ? null : problemOf(value, check);
    if (problem !== null) problems[token] = problem;
  }
  return problems;
};

export { nameProblems };
