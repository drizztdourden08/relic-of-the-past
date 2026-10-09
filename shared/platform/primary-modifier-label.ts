/* @layer shared-platform @kind logic */
import type { OsKind } from './platform-info.type';
import { USES_META } from './primary-modifier.constants';

const primaryModifierLabel = (os?: OsKind): string => (os !== undefined && USES_META.has(os) ? 'Cmd' : 'Ctrl');

export { primaryModifierLabel };
