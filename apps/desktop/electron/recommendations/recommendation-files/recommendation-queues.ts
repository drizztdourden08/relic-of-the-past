/* @layer electron-main @kind logic */
import type { EntityKind } from '@shared/game/data';

const recommendationQueues = new Map<EntityKind, Promise<unknown>>();

export { recommendationQueues };
