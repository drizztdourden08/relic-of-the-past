/* @layer shared-hud @kind logic */
import type { Raw } from './migrate-gap.type';

const isRecord = (value: unknown): value is Raw =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPair = (gap: unknown): boolean => isRecord(gap) && ('x' in gap || 'y' in gap);

const gapPatch = (value: Raw): Raw => {
  if (value.layout === 'grid') return {};
  const { gap } = value;
  if (gap === undefined || isPair(gap)) return {};
  return { gap: { x: gap, y: gap } };
};

export { gapPatch };
