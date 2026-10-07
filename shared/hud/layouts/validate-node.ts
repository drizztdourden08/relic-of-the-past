/* @layer shared-hud @kind logic */
/**
 * One node, checked and rebuilt.
 *
 * Rebuilt, not cast: what comes back is a fresh object carrying only the
 * keys this file understood, so a document that reaches the engine can never
 * smuggle a key past it. An unknown key is an error, not a silent drop,
 * because in a hand-edited file `gapp: 4` is a mis-typed gap and not a feature
 * from a newer build.
 *
 * A GLYPH NAMES A POSITION OR A SLOT, NEVER BOTH. `position` draws one control
 * whatever is bound to it - that is the d-pad's shared cross, and `DPAD` is the
 * synthetic name for it because no device reports "the whole d-pad" as a
 * position. `slot` draws the glyph of whatever slot N is bound to right now,
 * which is the binding-first rule a chip already follows. Asking for both would
 * be asking for two pictures in one box.
 *
 * A CONTAINER PICKS ITS ENGINE BY `layout`: absent or `'flex'` goes through
 * `validate-container.ts`'s flex path, `'grid'` through its grid path - the
 * arithmetic for each lives with the engine that reads it
 * (`place-flow.ts` / `place-grid.ts`), not here.
 *
 * `insideRepeat` THREADS DOWN EVERY CALL, flipping to true only for what sits
 * under a `repeat`'s own `child` (`validate-dynamic-node.ts`'s `repeatSpec`).
 * Every bindable field anywhere below that point may then name `index`,
 * `count` and `item` - the scope extras `validate-value.ts`'s `ValueContext`
 * already knows about, just never wired to a real field until this phase.
 *
 * A BUTTON DERIVES ITS OWN `dimWhenEmpty` INSTEAD OF HAVING ONE AUTHORED. A
 * slot-bound button already says which slot it stands for in `bind`, so
 * `[bind.index]` is written here once instead of asking an author to repeat
 * the same number under a different key - the same join
 * (`plans/hud-data-binding.html`) the rest of this system runs on.
 */

import { BOX_KEYS, checkKeys, isRecord, numberAt, validateBox } from './validate-box';
import { validateFlexContainer, validateGridContainer } from './validate-container';
import { repeatSpec, switchSpec } from './validate-dynamic-node';
import { shapeSpec } from './validate-shape-node';
import { countdownSpec } from './validate-countdown-node';
import { validateAnimations, validateTransition } from './validate-motion';
import { validateStyle } from './validate-style';
import { buttonSpec } from './validate-button-node';
import { textSpec } from './validate-text-node';
import { SDL_AXIS, SDL_BUTTON } from '../../input/sdl-buttons';
import type { HudElement, HudElementSpec, HudGlyphPosition, HudNode } from '../../types/hud/hud-node';
import type { Issues } from './validate-box';

const isGlyphPosition = (value: string): value is HudGlyphPosition =>
  value === 'DPAD' || value in SDL_BUTTON || value in SDL_AXIS;

/** A sprite's own natural box, when it is not the default 16x16 tile - see
 *  `hud-node.ts`'s own note on why this is a plain `{ w, h }` instead of a
 *  `Value` pair: it names the ASSET's shape, not a bindable quantity. */
const boxSizeAt = (value: unknown, path: string, issues: Issues): { w: number; h: number } | undefined => {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path}: expected { w, h }`); return undefined; }
  checkKeys(value, ['w', 'h'], path, issues);
  const w = numberAt(value.w, `${path}.w`, issues);
  const h = numberAt(value.h, `${path}.h`, issues);
  if (w === undefined || h === undefined) return undefined;
  if (w <= 0 || h <= 0) { issues.push(`${path}: both w and h must be greater than zero`); return undefined; }
  return { w, h };
};

const glyphSpec = (value: Record<string, unknown>, path: string, issues: Issues): HudElementSpec | null => {
  checkKeys(value, ['type', 'position', 'slot', 'pack'], path, issues);
  const hasPosition = value.position !== undefined;
  const hasSlot = value.slot !== undefined;
  if (hasPosition === hasSlot) {
    issues.push(`${path}: a glyph names either a position or a slot, and exactly one of them`);
    return null;
  }
  if (hasPosition) {
    if (typeof value.position !== 'string' || !isGlyphPosition(value.position)) {
      issues.push(`${path}.position: not an SDL position or 'DPAD': ${JSON.stringify(value.position)}`);
      return null;
    }
    return { type: 'glyph', position: value.position, ...(typeof value.pack === 'string' ? { pack: value.pack } : {}) };
  }
  const slot = numberAt(value.slot, `${path}.slot`, issues);
  if (slot === undefined || !Number.isInteger(slot) || slot < 1) {
    issues.push(`${path}.slot: a slot number is 1 or more`);
    return null;
  }
  return { type: 'glyph', slot, ...(typeof value.pack === 'string' ? { pack: value.pack } : {}) };
};

const elementSpec = (
  value: unknown, path: string, issues: Issues, seen: Set<string>, insideRepeat: boolean,
): HudElementSpec | null => {
  if (!isRecord(value)) {
    issues.push(`${path}: expected an element spec object`);
    return null;
  }
  const type = value.type;
  if (type === 'spacer') {
    checkKeys(value, ['type'], path, issues);
    return { type: 'spacer' };
  }
  if (type === 'glyph') return glyphSpec(value, path, issues);
  if (type === 'slot') {
    checkKeys(value, ['type', 'index'], path, issues);
    const index = numberAt(value.index, `${path}.index`, issues);
    if (index === undefined || !Number.isInteger(index) || index < 1) {
      issues.push(`${path}.index: a slot number is 1 or more`);
      return null;
    }
    return { type: 'slot', index };
  }
  if (type === 'sprite') {
    checkKeys(value, ['type', 'file', 'box'], path, issues);
    if (typeof value.file !== 'string' || !value.file.trim()) {
      issues.push(`${path}.file: a sprite needs a file`);
      return null;
    }
    const box = boxSizeAt(value.box, `${path}.box`, issues);
    if (value.box !== undefined && box === undefined) return null;
    return { type: 'sprite', file: value.file, ...(box ? { box } : {}) };
  }
  if (type === 'text') return textSpec(value, path, issues, insideRepeat);
  if (type === 'button') return buttonSpec(value, path, issues);
  if (type === 'shape') return shapeSpec(value, path, issues, insideRepeat);
  if (type === 'countdown') return countdownSpec(value, path, issues);
  if (type === 'repeat') return repeatSpec(value, path, issues, seen, validateNode, insideRepeat);
  if (type === 'switch') return switchSpec(value, path, issues, seen, validateNode, insideRepeat);
  issues.push(`${path}.type: unknown element type ${JSON.stringify(type)}`);
  return null;
};

/** A slot-bound button's `dimWhenEmpty` is derived from its own `bind`, never
 *  authored - see the file header. A verb bind is a core control and is never
 *  considered empty. */
const buttonDimWhenEmpty = (spec: HudElementSpec): number[] | undefined => (
  spec.type === 'button' && spec.bind.kind === 'slot' ? [spec.bind.index] : undefined
);

const validateElement = (
  value: Record<string, unknown>, path: string, issues: Issues, seen: Set<string>, insideRepeat: boolean,
): HudElement | null => {
  checkKeys(value, [...BOX_KEYS, 'kind', 'element', 'fit'], path, issues);
  if (value.fit !== undefined && value.fit !== 'contain') {
    issues.push(`${path}.fit: 'contain' is the only fit there is - nothing ever stretches`);
  }
  const spec = elementSpec(value.element, `${path}.element`, issues, seen, insideRepeat);
  if (!spec) return null;
  const style = validateStyle(value.style, `${path}.style`, issues, insideRepeat);
  const animation = validateAnimations(value.animation, `${path}.animation`, issues, insideRepeat);
  const transition = validateTransition(value.transition, `${path}.transition`, issues, insideRepeat);
  const dimWhenEmpty = buttonDimWhenEmpty(spec);
  return {
    ...validateBox(value, path, issues, insideRepeat),
    kind: 'element',
    element: spec,
    fit: 'contain',
    ...(style ? { style } : {}),
    ...(animation ? { animation } : {}),
    ...(transition ? { transition } : {}),
    ...(dimWhenEmpty ? { dimWhenEmpty } : {}),
  };
};

const validateNode = (
  value: unknown, path: string, issues: Issues, seen: Set<string>, insideRepeat = false,
): HudNode | null => {
  if (!isRecord(value)) {
    issues.push(`${path}: expected a node object`);
    return null;
  }
  const id = value.id;
  if (typeof id === 'string' && id) {
    if (seen.has(id)) issues.push(`${path}.id: '${id}' is used more than once`);
    seen.add(id);
  }
  if (value.kind === 'container') {
    return value.layout === 'grid'
      ? validateGridContainer(value, path, issues, seen, validateNode, insideRepeat)
      : validateFlexContainer(value, path, issues, seen, validateNode, insideRepeat);
  }
  if (value.kind === 'element') return validateElement(value, path, issues, seen, insideRepeat);
  issues.push(`${path}.kind: expected 'container' or 'element', got ${JSON.stringify(value.kind)}`);
  return null;
};

export { validateNode };
