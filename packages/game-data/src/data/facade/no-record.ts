/* @layer shared-game @kind logic */
import type { EntityKind } from '../types';

const noRecord = (kind: EntityKind, id: string): never => {
  throw new Error(`no ${kind} record with id '${id}'`);
};

export { noRecord };
