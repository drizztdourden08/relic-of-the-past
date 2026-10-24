/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';

const noPathMessage = (kind: EntityKind, action: string): string =>
  `The ${kind} collection does not support ${action}.`;

export { noPathMessage };
