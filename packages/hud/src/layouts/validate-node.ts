/* @layer shared-hud @kind logic */
import { BOX_KEYS, checkKeys, isRecord, numberAt, validateBox } from './validate-box';
import { validateFlexContainer, validateGridContainer } from './validate-container';
import { repeatSpec, switchSpec } from './validate-dynamic-node';
import { shapeSpec } from './validate-shape-node';
import { countdownSpec } from './validate-countdown-node';
import { validateAnimations, validateTransition } from './validate-motion';
import { validateStyle } from './validate-style';
import { buttonSpec } from './validate-button-node';
import { textSpec } from './validate-text-node';
import { SDL_AXIS, SDL_BUTTON } from '@rotp/game-data';
import type { HudElement, HudElementSpec, HudGlyphPosition, HudNode } from '../types/hud-node';
import type { Issues } from './validate-box';

const isGlyphPosition = (value: string): value is HudGlyphPosition =>
  value === 'DPAD' || value in SDL_BUTTON || value in SDL_AXIS;

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
