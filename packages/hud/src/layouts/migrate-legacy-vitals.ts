/* @layer shared-hud @kind logic */
import { instantiatePreset } from '../presets';
import { CONSUMABLE_PRESET_IDS, LEGACY_TYPES } from './migrate-legacy-vitals.constants';
import type { HudNode } from '../types/hud-node';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const composedConsumables = (): HudNode => {
  const rows = CONSUMABLE_PRESET_IDS
    .map((id) => instantiatePreset(id))
    .filter((node): node is HudNode => node !== null);
  return { kind: 'container', id: 'consumables', direction: 'column', children: rows };
};

const legacyReplacement = (type: string): HudNode | null => {
  if (type === 'life') return instantiatePreset('hearts');
  if (type === 'magic') return instantiatePreset('magic-bar');
  if (type === 'wallet') return instantiatePreset('wallet');
  if (type === 'consumables') return composedConsumables();
  return null;
};

const presetNodeFor = (value: Record<string, unknown>, type: string): unknown => {
  if (!LEGACY_TYPES.includes(type)) return undefined;
  const replacement = legacyReplacement(type);
  if (!replacement) return undefined;
  const { kind: _kind, element: _element, ...box } = value;
  const id = typeof value.id === 'string' && value.id ? value.id : replacement.id;
  return { ...replacement, ...box, id };
};

const migrateSwitch = (value: Record<string, unknown>, element: Record<string, unknown>): unknown => {
  const cases = Array.isArray(element.cases)
    ? element.cases.map((entry: unknown) => (isRecord(entry) ? { ...entry, node: migrateNode(entry.node) } : entry))
    : element.cases;
  return {
    ...value,
    element: {
      ...element,
      cases,
      ...(element.otherwise !== undefined ? { otherwise: migrateNode(element.otherwise) } : {}),
    },
  };
};

const migrateElement = (value: Record<string, unknown>, element: Record<string, unknown>): unknown => {
  const { type } = element;
  if (typeof type !== 'string') return value;
  const replaced = presetNodeFor(value, type);
  if (replaced !== undefined) return replaced;
  if (type === 'repeat' && isRecord(element.child)) {
    return { ...value, element: { ...element, child: migrateNode(element.child) } };
  }
  if (type === 'switch') return migrateSwitch(value, element);
  return value;
};

const migrateNode = (value: unknown): unknown => {
  if (!isRecord(value)) return value;
  if (value.kind === 'element') return isRecord(value.element) ? migrateElement(value, value.element) : value;
  if (value.kind === 'container' && Array.isArray(value.children)) {
    return { ...value, children: value.children.map(migrateNode) };
  }
  return value;
};

const migrateLegacyVitals = (value: unknown): unknown => {
  if (!isRecord(value) || !isRecord(value.screen)) return value;
  return { ...value, screen: migrateNode(value.screen) };
};

export { migrateLegacyVitals };
