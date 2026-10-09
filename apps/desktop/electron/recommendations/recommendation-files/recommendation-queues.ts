/* @layer electron-main @kind logic */
import type { EntityKind } from '@rotp/game-data';

const recommendationQueues = new Map<EntityKind, Promise<unknown>>();

export { recommendationQueues };
