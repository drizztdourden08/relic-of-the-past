/* @layer renderer-components @kind logic */
import { DIRECTION_PREFIX } from './mapping-parser.constants';
import type { ParsedMapping } from './mapping-parser.type';

const stripDirection = (value: string): string => value.replace(DIRECTION_PREFIX, '');

const parseGamepadMapping = (mapping: string): ParsedMapping | null => {
  const parts = mapping.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const [guid, name, ...fields] = parts;
  const buttonIndexToKey = new Map<number, string>();
  const hatToKey = new Map<string, string>();
  const axisIndexToKey = new Map<number, string>();

  for (const field of fields) {
    const [key, rawValue] = field.split(':');
    if (!key || !rawValue) continue;
    const value = stripDirection(rawValue);
    if (value.startsWith('b')) {
      const index = Number(value.slice(1));
      if (Number.isFinite(index)) buttonIndexToKey.set(index, key);
    } else if (value.startsWith('h')) {
      const [hatIndex, hatMask] = value.slice(1).split('.');
      if (hatIndex !== undefined && hatMask !== undefined) hatToKey.set(`${hatIndex}.${hatMask}`, key);
    } else if (value.startsWith('a')) {
      const index = Number(value.slice(1));
      if (Number.isFinite(index)) axisIndexToKey.set(index, key);
    }
  }

  return { guid, name, buttonIndexToKey, hatToKey, axisIndexToKey };
};

export { parseGamepadMapping };
