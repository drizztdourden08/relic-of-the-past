/* @layer renderer-components @kind logic */
import { NESTED_NODE_KEYS } from './bound-values.constants';
import type { HudNode } from '@shared/types/hud';
import type { BoundValue } from './bound-values.type';

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

const collectBoundValues = (node: HudNode): BoundValue[] => walk(node, '');

export { collectBoundValues };
