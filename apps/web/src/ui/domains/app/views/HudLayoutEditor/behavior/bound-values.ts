/* @layer renderer-components @kind logic */
/**
 * Every data-bound `Value` on ONE node, in one place. It is the Data section's
 * own reason to exist ("what makes this move?") and the source of the
 * bound-count badge every other section's collapsed header carries.
 *
 * A GENERIC WALK, not a hand-enumerated field list. `Value`'s bound shape
 * (`{ from: 'data', expr }`) is structurally distinctive enough to find by
 * shape alone, so this walks the whole node object looking for it instead of
 * naming `scale`/`opacity`/`style.tint.amount` and so on one at a time. That is
 * also why it costs nothing to keep in step: a future bindable field is found
 * the moment it exists, with no second list to update here. It does NOT
 * descend into a nested node's own subtree (`child`, `node`, `otherwise`),
 * because each is a DIFFERENT node with its own Data section. This one answers
 * only for the node it was handed.
 */
import type { HudNode } from '@shared/types/hud';

interface BoundValue { path: string; expr: string }

const NESTED_NODE_KEYS = new Set(['child', 'node', 'otherwise', 'children']);

const isBoundValue = (value: unknown): value is { from: 'data'; expr: string } =>
  typeof value === 'object' && value !== null
  && (value as Record<string, unknown>).from === 'data'
  && typeof (value as Record<string, unknown>).expr === 'string';

const walk = (value: unknown, path: string): BoundValue[] => {
  if (value === null || value === undefined) return [];
  if (isBoundValue(value)) return [{ path, expr: value.expr }];
  if (Array.isArray(value)) return value.flatMap((entry, i) => walk(entry, `${path}[${i}]`));
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, entry]) => {
      if (NESTED_NODE_KEYS.has(key)) return [];
      return walk(entry, path ? `${path}.${key}` : key);
    });
  }
  return [];
};

/** Every bound `Value` on `node` itself, and none on a case/child it embeds. */
const collectBoundValues = (node: HudNode): BoundValue[] => walk(node, '');

type SectionKey = 'layout' | 'sizeBox' | 'appearance' | 'content' | 'animation' | 'transitions';

/** Classifies one bound value's path by which section owns the field it
 *  names. The top-level property name is enough, since every section's own
 *  fields share one first segment (`style.*` is always Appearance, `element.*`
 *  is always Content, and so on). */
const sectionOfPath = (path: string): SectionKey | null => {
  const head = path.split(/[.[]/, 1)[0];
  if (head === 'gap' || head === 'columns' || head === 'rows') return 'layout';
  if (head === 'size' || head === 'min' || head === 'max' || head === 'scale') return 'sizeBox';
  if (head === 'opacity' || head === 'visible' || head === 'style') return 'appearance';
  if (head === 'element') return 'content';
  if (head === 'animation') return 'animation';
  if (head === 'transition') return 'transitions';
  return null;
};

/** How many of `node`'s own bound values belong to each section, for the small
 *  `● n` badge every collapsed header carries. */
const boundCountsBySection = (node: HudNode): Partial<Record<SectionKey, number>> => {
  const counts: Partial<Record<SectionKey, number>> = {};
  collectBoundValues(node).forEach(({ path }) => {
    const section = sectionOfPath(path);
    if (!section) return;
    counts[section] = (counts[section] ?? 0) + 1;
  });
  return counts;
};

export { boundCountsBySection, collectBoundValues };
export type { BoundValue, SectionKey };
