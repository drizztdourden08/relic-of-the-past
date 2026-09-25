/* @layer shared-hud @kind logic */
/**
 * The document itself: identity, and the one tree.
 *
 * A BAD DOCUMENT FAILS LOUDLY AND NEVER HALF-DRAWS. Every problem in the file
 * is collected, not just the first, and each one names the path it was found
 * at - so a hand-edited built-in and a player's saved layout both answer the
 * same question ("which line is wrong?") the same way.
 *
 * The result is a clean document built from scratch out of the values that were
 * understood. Nothing the validator did not read can survive into the engine.
 *
 * `validateValue` (`./validate-value`) is re-exported from here for the same
 * reason `validateNode` lives beside it: it is the funnel a bad EXPRESSION
 * refuses the document through, the moment a field is typed as a `Value`
 * (phase 2 of `plans/hud-data-binding.html`, not this one) - "an unparseable
 * expression or an unknown variable is refused, naming the field and the
 * column" is a rule about this file's contract, not a separate one bolted on
 * beside it.
 */

import { checkKeys, isRecord } from './validate-box';
import { validateNode } from './validate-node';
import { collectReflowWarnings } from './validate-motion-warnings';
import { validateValue } from './validate-value';
import { MAX_EXPANDED_NODES, worstCaseNodeCount } from './validate-expand-budget';
import type { HudClusterReveal, HudLayout, HudScreenRoot } from '../../types/hud/hud-layout';
import type { Issues } from './validate-box';

const REVEALS: readonly HudClusterReveal[] = ['always', 'on-change', 'never'];

interface ValidationResult {
  doc: HudLayout | null;
  errors: string[];
  /**
   * Non-blocking notes - unlike `errors`, a document with one of these still
   * loads. Today this is exactly one kind: an animated `width`/`height`
   * inside a flow container (`validate-motion-warnings.ts`) - "a note, not an
   * error" (the plan's own words, echoing the out-of-range slot note in
   * §23.5), structured for phase 7's Animation section to render instead of
   * left as a comment only a reader of this file would ever see.
   */
  warnings: string[];
}

/**
 * THE FIELDS THE SCREEN MAY NOT ANSWER. Its rectangle is the view, always, so
 * every key that would argue with that is refused by name, not ignored:
 * a size it cannot honour, a margin outside a box that has no outside, a scale
 * over a coordinate system fixed to the display, and the four fields that only
 * mean something to a child of some parent - which the screen has not got.
 *
 * ITS ENGINE IS NOT ON THIS LIST and never was: §38.4's lock lived in the
 * editor, and §42 lifted it. `layout`, `direction`, `columns` and `rows` are
 * the author's to set - a screen that IS a grid has a template worth editing.
 */
const SCREEN_LOCKED = [
  'size', 'min', 'max', 'margin', 'scale', 'place', 'order', 'alignSelf', 'justifySelf', 'dimWhenEmpty',
] as const;

const validateScreen = (value: unknown, issues: Issues, seen: Set<string>): HudScreenRoot | null => {
  const node = validateNode(value, 'layout.screen', issues, seen);
  if (!node) return null;
  if (node.kind !== 'container') {
    issues.push('layout.screen: the screen is a container - it is the box the whole layout sits inside');
    return null;
  }
  const fields = node as unknown as Record<string, unknown>;
  for (const key of SCREEN_LOCKED) {
    if (fields[key] !== undefined) {
      issues.push(
        `layout.screen.${key}: the screen is always exactly the view - `
        + `${key} is not a question it can answer`,
      );
    }
  }
  return node;
};

const validateLayout = (value: unknown): ValidationResult => {
  const errors: Issues = [];
  if (!isRecord(value)) return { doc: null, errors: ['expected a layout document object'], warnings: [] };
  checkKeys(
    value,
    ['id', 'name', 'builtIn', 'basedOn', 'glyphPack', 'inGameplay', 'screen'],
    'layout',
    errors,
  );

  const id = typeof value.id === 'string' && value.id.trim() ? value.id : '';
  if (!id) errors.push('layout.id: a layout needs a non-empty id');
  const name = typeof value.name === 'string' && value.name.trim() ? value.name : '';
  if (!name) errors.push('layout.name: a layout needs a non-empty name');
  if (typeof value.builtIn !== 'boolean') errors.push('layout.builtIn: expected true or false');
  if (value.basedOn !== undefined && typeof value.basedOn !== 'string') {
    errors.push('layout.basedOn: expected the id of the layout this one started from');
  }
  if (value.glyphPack !== undefined && typeof value.glyphPack !== 'string') {
    errors.push("layout.glyphPack: expected a pack id, or 'auto' to follow the device");
  }
  const reveal = REVEALS.find((candidate) => candidate === value.inGameplay);
  if (value.inGameplay !== undefined && !reveal) {
    errors.push(`layout.inGameplay: expected one of ${REVEALS.join(', ')}, got ${JSON.stringify(value.inGameplay)}`);
  }
  const seen = new Set<string>();
  const screen = value.screen === undefined ? null : validateScreen(value.screen, errors, seen);
  if (value.screen === undefined) errors.push('layout.screen: a layout with no screen draws nothing');
  if (!screen || errors.length) return { doc: null, errors, warnings: [] };

  // A repeat/switch's worst case is priced across the WHOLE document, which is
  // one tree now - `expand.ts`'s own runtime budget is the same single counter,
  // and for the same reason: two neighbouring subtrees each near the limit
  // still add up past what one frame should ever draw.
  const worstCase = worstCaseNodeCount(screen);
  if (worstCase > MAX_EXPANDED_NODES) {
    errors.push(
      `layout.screen: worst-case expansion is ${worstCase} nodes, over the ${MAX_EXPANDED_NODES} limit - `
      + `a repeat's count or a switch's cases are drawing too much`,
    );
    return { doc: null, errors, warnings: [] };
  }

  return {
    doc: {
      id,
      name,
      builtIn: value.builtIn === true,
      ...(typeof value.basedOn === 'string' ? { basedOn: value.basedOn } : {}),
      ...(typeof value.glyphPack === 'string' ? { glyphPack: value.glyphPack } : {}),
      ...(reveal ? { inGameplay: reveal } : {}),
      screen,
    },
    errors,
    warnings: collectReflowWarnings(screen),
  };
};

export { validateLayout, validateValue };
export type { ValidationResult };
