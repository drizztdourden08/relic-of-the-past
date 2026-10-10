/* @layer shared-hud @kind logic */
import { BOX_KEYS, checkKeys, isRecord, numberAt, validateBox } from './validate-box';
import { motionParts, validateFlexContainer, validateGridContainer } from './validate-container';
import { repeatSpec, switchSpec } from './validate-dynamic-node';
import { shapeSpec } from './validate-shape-node';
import { countdownSpec } from './validate-countdown-node';
import { buttonSpec } from './validate-button-node';
import { textSpec } from './validate-text-node';
import { SDL_AXIS, SDL_BUTTON } from '@rotp/game-data';
import type { HudElement, HudElementSpec, HudGlyphPosition, HudNode } from '../types/hud-node';
import type { Issues } from './validate-box';
import type { NodeContext } from './validate-container';
import type { SpecReader } from './validate-node.type';

const isGlyphPosition = (value: string): value is HudGlyphPosition =>
  value === 'DPAD' || value in SDL_BUTTON || value in SDL_AXIS;

const packOf = (value: Record<string, unknown>): { pack?: string } =>
  (typeof value.pack === 'string' ? { pack: value.pack } : {});

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

const slotNumberAt = (raw: unknown, path: string, issues: Issues): number | null => {
  const slot = numberAt(raw, path, issues);
  if (slot === undefined || !Number.isInteger(slot) || slot < 1) {
    issues.push(`${path}: a slot number is 1 or more`);
    return null;
  }
  return slot;
};

const glyphSpec = (value: Record<string, unknown>, path: string, issues: Issues): HudElementSpec | null => {
  checkKeys(value, ['type', 'position', 'slot', 'pack'], path, issues);
  const hasPosition = value.position !== undefined;
  if (hasPosition === (value.slot !== undefined)) {
    issues.push(`${path}: a glyph names either a position or a slot, and exactly one of them`);
    return null;
  }
  if (hasPosition) {
    if (typeof value.position !== 'string' || !isGlyphPosition(value.position)) {
      issues.push(`${path}.position: not an SDL position or 'DPAD': ${JSON.stringify(value.position)}`);
      return null;
    }
    return { type: 'glyph', position: value.position, ...packOf(value) };
  }
  const slot = slotNumberAt(value.slot, `${path}.slot`, issues);
  return slot === null ? null : { type: 'glyph', slot, ...packOf(value) };
};

const slotSpec = (value: Record<string, unknown>, path: string, issues: Issues): HudElementSpec | null => {
  checkKeys(value, ['type', 'index'], path, issues);
  const index = slotNumberAt(value.index, `${path}.index`, issues);
  return index === null ? null : { type: 'slot', index };
};

const spriteSpec = (value: Record<string, unknown>, path: string, issues: Issues): HudElementSpec | null => {
  checkKeys(value, ['type', 'file', 'box'], path, issues);
  if (typeof value.file !== 'string' || !value.file.trim()) {
    issues.push(`${path}.file: a sprite needs a file`);
    return null;
  }
  const box = boxSizeAt(value.box, `${path}.box`, issues);
  if (value.box !== undefined && box === undefined) return null;
  return { type: 'sprite', file: value.file, ...(box ? { box } : {}) };
};

const specReaders = new Map<string, SpecReader>([
  ['spacer', (value, path, { issues }) => { checkKeys(value, ['type'], path, issues); return { type: 'spacer' }; }],
  ['glyph', (value, path, { issues }) => glyphSpec(value, path, issues)],
  ['slot', (value, path, { issues }) => slotSpec(value, path, issues)],
  ['sprite', (value, path, { issues }) => spriteSpec(value, path, issues)],
  ['text', (value, path, { issues, insideRepeat }) => textSpec(value, path, issues, insideRepeat)],
  ['button', (value, path, { issues }) => buttonSpec(value, path, issues)],
  ['shape', (value, path, { issues, insideRepeat }) => shapeSpec(value, path, issues, insideRepeat)],
  ['countdown', (value, path, { issues }) => countdownSpec(value, path, issues)],
  ['repeat', (value, path, ctx) => repeatSpec(value, path, ctx, validateNode)],
  ['switch', (value, path, ctx) => switchSpec(value, path, ctx, validateNode)],
]);

const elementSpec = (value: unknown, path: string, ctx: NodeContext): HudElementSpec | null => {
  if (!isRecord(value)) {
    ctx.issues.push(`${path}: expected an element spec object`);
    return null;
  }
  const reader = typeof value.type === 'string' ? specReaders.get(value.type) : undefined;
  if (reader) return reader(value, path, ctx);
  ctx.issues.push(`${path}.type: unknown element type ${JSON.stringify(value.type)}`);
  return null;
};

const buttonDimWhenEmpty = (spec: HudElementSpec): number[] | undefined => (
  spec.type === 'button' && spec.bind.kind === 'slot' ? [spec.bind.index] : undefined
);

const validateElement = (value: Record<string, unknown>, path: string, ctx: NodeContext): HudElement | null => {
  const { issues, insideRepeat } = ctx;
  checkKeys(value, [...BOX_KEYS, 'kind', 'element', 'fit'], path, issues);
  if (value.fit !== undefined && value.fit !== 'contain') {
    issues.push(`${path}.fit: 'contain' is the only fit there is - nothing ever stretches`);
  }
  const spec = elementSpec(value.element, `${path}.element`, ctx);
  if (!spec) return null;
  const motion = motionParts(value, path, issues, insideRepeat);
  const dimWhenEmpty = buttonDimWhenEmpty(spec);
  return {
    ...validateBox(value, path, issues, insideRepeat),
    kind: 'element',
    element: spec,
    fit: 'contain',
    ...motion,
    ...(dimWhenEmpty ? { dimWhenEmpty } : {}),
  };
};

const noteId = (value: Record<string, unknown>, path: string, ctx: NodeContext): void => {
  const id = value.id;
  if (typeof id !== 'string' || !id) return;
  if (ctx.seen.has(id)) ctx.issues.push(`${path}.id: '${id}' is used more than once`);
  ctx.seen.add(id);
};

const validateNode = (value: unknown, path: string, ctx: NodeContext): HudNode | null => {
  if (!isRecord(value)) {
    ctx.issues.push(`${path}: expected a node object`);
    return null;
  }
  noteId(value, path, ctx);
  if (value.kind === 'container') {
    return value.layout === 'grid'
      ? validateGridContainer(value, path, ctx, validateNode)
      : validateFlexContainer(value, path, ctx, validateNode);
  }
  if (value.kind === 'element') return validateElement(value, path, ctx);
  ctx.issues.push(`${path}.kind: expected 'container' or 'element', got ${JSON.stringify(value.kind)}`);
  return null;
};

export { validateNode };
