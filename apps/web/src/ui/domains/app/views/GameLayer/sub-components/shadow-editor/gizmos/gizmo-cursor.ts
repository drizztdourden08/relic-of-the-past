/* @layer renderer-components @kind logic */
import type { GizmoPart } from './gizmo.type';
import { CURSOR_MAP } from './gizmo.constants';

const getGizmoCursor = (part: GizmoPart | null): string => {
  if (!part) return 'default';
  const hit = CURSOR_MAP[part];
  return hit ?? 'default';
};

export { getGizmoCursor };
