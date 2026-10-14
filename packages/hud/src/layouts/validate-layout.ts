/* @layer shared-hud @kind logic */
import { checkKeys, isRecord, nonEmptyText } from './validate-box';
import { validateNode } from './validate-node';
import { collectReflowWarnings } from './validate-motion-warnings';
import { worstCaseNodeCount } from './validate-expand-budget';
import { MAX_EXPANDED_NODES } from '../data/expand-limits.constants';
import { LAYOUT_KEYS, REVEALS, SCREEN_LOCKED } from './validate-layout.constants';
import type { HudClusterReveal, HudLayout, HudScreenRoot } from '../types/hud-layout';
import type { Issues } from './validate-box';
import type { LayoutHeader, ValidationResult } from './validate-layout.type';

const validateScreen = (value: unknown, issues: Issues, seen: Set<string>): HudScreenRoot | null => {
  const node = validateNode(value, 'layout.screen', { issues, seen, insideRepeat: false });
  if (!node) return null;
  if (node.kind !== 'container') {
    issues.push('layout.screen: the screen is a container - it is the box the whole layout sits inside');
    return null;
  }
  for (const key of SCREEN_LOCKED) {
    if (Reflect.get(node, key) !== undefined) {
      issues.push(
        `layout.screen.${key}: the screen is always exactly the view - `
        + `${key} is not a question it can answer`,
      );
    }
  }
  return node;
};

const checkOptionalText = (field: unknown, path: string, message: string, errors: Issues): void => {
  if (field !== undefined && typeof field !== 'string') errors.push(`${path}: ${message}`);
};

const checkHeader = (value: Record<string, unknown>, errors: Issues): LayoutHeader => {
  checkKeys(value, LAYOUT_KEYS, 'layout', errors);
  const id = nonEmptyText(value.id);
  if (!id) errors.push('layout.id: a layout needs a non-empty id');
  const name = nonEmptyText(value.name);
  if (!name) errors.push('layout.name: a layout needs a non-empty name');
  if (typeof value.builtIn !== 'boolean') errors.push('layout.builtIn: expected true or false');
  checkOptionalText(value.basedOn, 'layout.basedOn', 'expected the id of the layout this one started from', errors);
  checkOptionalText(value.glyphPack, 'layout.glyphPack', "expected a pack id, or 'auto' to follow the device", errors);
  const reveal = REVEALS.find((candidate) => candidate === value.inGameplay);
  if (value.inGameplay !== undefined && !reveal) {
    errors.push(`layout.inGameplay: expected one of ${REVEALS.join(', ')}, got ${JSON.stringify(value.inGameplay)}`);
  }
  return { id, name, reveal };
};

const optionalFields = (value: Record<string, unknown>, reveal: HudClusterReveal | undefined): Partial<HudLayout> => ({
  ...(typeof value.basedOn === 'string' ? { basedOn: value.basedOn } : {}),
  ...(typeof value.glyphPack === 'string' ? { glyphPack: value.glyphPack } : {}),
  ...(reveal ? { inGameplay: reveal } : {}),
});

const validateLayout = (value: unknown): ValidationResult => {
  const errors: Issues = [];
  if (!isRecord(value)) return { doc: null, errors: ['expected a layout document object'], warnings: [] };
  const { id, name, reveal } = checkHeader(value, errors);
  const screen = value.screen === undefined ? null : validateScreen(value.screen, errors, new Set<string>());
  if (value.screen === undefined) errors.push('layout.screen: a layout with no screen draws nothing');
  if (!screen || errors.length) return { doc: null, errors, warnings: [] };

  const worstCase = worstCaseNodeCount(screen);
  if (worstCase > MAX_EXPANDED_NODES) {
    errors.push(
      `layout.screen: worst-case expansion is ${worstCase} nodes, over the ${MAX_EXPANDED_NODES} limit - `
      + `a repeat's count or a switch's cases are drawing too much`,
    );
    return { doc: null, errors, warnings: [] };
  }

  return {
    doc: { id, name, builtIn: value.builtIn === true, ...optionalFields(value, reveal), screen },
    errors,
    warnings: collectReflowWarnings(screen),
  };
};

export { validateLayout };
