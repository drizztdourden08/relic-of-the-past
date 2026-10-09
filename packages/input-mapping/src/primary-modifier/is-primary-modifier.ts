/* @layer shared-platform @kind logic */
import type { OsKind } from '@drizztdourden08/brock-core';
import { USES_META } from './primary-modifier.constants';
import type { ModifierFlags } from './primary-modifier.type';

const isPrimaryModifier = (event: ModifierFlags, os?: OsKind): boolean => {
  if (os === undefined || os === 'unknown') return event.ctrlKey || event.metaKey;
  return USES_META.has(os) ? event.metaKey : event.ctrlKey;
};

export { isPrimaryModifier };
