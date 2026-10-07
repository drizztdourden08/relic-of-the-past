/* @layer shared-hud @kind logic */
/**
 * `button` holds a control's bind and a face per state. `idle` is the only
 * required state; anything else missing falls back to it at render time
 * (`HudButton`), so this file only has to check the shapes it was given, not
 * fill the fallback in itself.
 */

import { checkKeys, isRecord, numberAt } from './validate-box';
import { SDL_AXIS, SDL_BUTTON } from '../../input/sdl-buttons';
import type { Issues } from './validate-box';
import type { HudButtonBind, HudButtonFace, HudButtonSpec, HudButtonVerb } from '../../types/hud/hud-button';

const VERBS = ['up', 'down', 'left', 'right', 'pause', 'map'] as const;
const STATES = ['idle', 'pressed', 'held', 'unassigned'] as const;

/** Same rule `validate-node.ts`'s `glyph` element checks a position against -
 *  duplicated instead of imported, since that file will import THIS one. */
const isGlyphPosition = (value: string): boolean => value === 'DPAD' || value in SDL_BUTTON || value in SDL_AXIS;

const bindAt = (value: unknown, path: string, issues: Issues): HudButtonBind | null => {
  if (!isRecord(value)) { issues.push(`${path}: a button needs a bind`); return null; }
  if (value.kind === 'verb') {
    checkKeys(value, ['kind', 'verb'], path, issues);
    if (typeof value.verb !== 'string' || !(VERBS as readonly string[]).includes(value.verb)) {
      issues.push(`${path}.verb: expected one of ${VERBS.join(', ')}, got ${JSON.stringify(value.verb)}`);
      return null;
    }
    return { kind: 'verb', verb: value.verb as HudButtonVerb };
  }
  if (value.kind === 'slot') {
    checkKeys(value, ['kind', 'index'], path, issues);
    const index = numberAt(value.index, `${path}.index`, issues);
    if (index === undefined || !Number.isInteger(index) || index < 1) {
      issues.push(`${path}.index: a slot number is 1 or more`);
      return null;
    }
    return { kind: 'slot', index };
  }
  issues.push(`${path}.kind: expected 'verb' or 'slot', got ${JSON.stringify(value.kind)}`);
  return null;
};

const faceAt = (value: unknown, path: string, issues: Issues): HudButtonFace | undefined => {
  if (!isRecord(value)) { issues.push(`${path}: expected { from: 'image', file } or { from: 'glyph', pack, glyph }`); return undefined; }
  if (value.from === 'image') {
    checkKeys(value, ['from', 'file'], path, issues);
    if (typeof value.file !== 'string' || !value.file.trim()) { issues.push(`${path}.file: a face needs a file`); return undefined; }
    return { from: 'image', file: value.file };
  }
  if (value.from === 'glyph') {
    checkKeys(value, ['from', 'pack', 'glyph'], path, issues);
    if (typeof value.pack !== 'string' || !value.pack.trim()) { issues.push(`${path}.pack: a glyph face needs a pack`); return undefined; }
    if (typeof value.glyph !== 'string' || !isGlyphPosition(value.glyph)) {
      issues.push(`${path}.glyph: not an SDL position or 'DPAD': ${JSON.stringify(value.glyph)}`);
      return undefined;
    }
    return { from: 'glyph', pack: value.pack, glyph: value.glyph };
  }
  issues.push(`${path}.from: expected 'image' or 'glyph', got ${JSON.stringify(value.from)}`);
  return undefined;
};

const statesAt = (value: unknown, path: string, issues: Issues): HudButtonSpec['states'] | null => {
  if (!isRecord(value)) { issues.push(`${path}: a button needs states`); return null; }
  checkKeys(value, STATES, path, issues);
  const idle = faceAt(value.idle, `${path}.idle`, issues);
  if (!idle) return null;
  const rest: Partial<HudButtonSpec['states']> = {};
  (['pressed', 'held', 'unassigned'] as const).forEach((state) => {
    if (value[state] === undefined) return;
    const face = faceAt(value[state], `${path}.${state}`, issues);
    if (face) rest[state] = face;
  });
  return { idle, ...rest };
};

const BUTTON_KEYS = ['type', 'bind', 'states'] as const;

const buttonSpec = (value: Record<string, unknown>, path: string, issues: Issues): HudButtonSpec | null => {
  checkKeys(value, BUTTON_KEYS, path, issues);
  const bind = bindAt(value.bind, `${path}.bind`, issues);
  const states = statesAt(value.states, `${path}.states`, issues);
  if (!bind || !states) return null;
  return { type: 'button', bind, states };
};

export { buttonSpec };
