/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import { ENTITY_KINDS } from '../DataInspector.constants';

const asEntityKind = (value: string | undefined): EntityKind | undefined =>
  ENTITY_KINDS.find(kind => kind === value);

export { asEntityKind };
