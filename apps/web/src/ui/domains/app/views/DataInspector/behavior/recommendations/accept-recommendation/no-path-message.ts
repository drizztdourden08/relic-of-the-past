/* @layer renderer-app @kind logic */
import type { EntityKind } from '@shared/game/data';

const noPathMessage = (kind: EntityKind, action: string): string =>
  `No ${action} path is wired for the ${kind} collection.`;

export { noPathMessage };
