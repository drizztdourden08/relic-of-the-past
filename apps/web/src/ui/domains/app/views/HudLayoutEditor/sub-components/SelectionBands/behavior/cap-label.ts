/* @layer renderer-components @kind logic */
import { primaryModifierLabel } from '@shared/platform';
import type { OsKind } from '@shared/platform';

const capLabel = (key: string, os: OsKind): string => {
  if (key !== '{mod}') return key;
  const word = primaryModifierLabel(os);
  return word === 'Cmd' ? '⌘' : word;
};

export { capLabel };
