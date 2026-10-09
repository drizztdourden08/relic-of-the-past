/* @layer renderer-app @kind logic */
import type { EntityKind } from '@shared/game/data';
import { PREFIX_TO_KIND } from './record-links.constants';

const entityKindFromId = (id: string): EntityKind | undefined => {
  const prefix = id.slice(0, id.lastIndexOf('-'));
  return PREFIX_TO_KIND[prefix];
};

export { entityKindFromId };
