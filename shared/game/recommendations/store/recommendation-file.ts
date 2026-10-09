/* @layer shared-game @kind logic */
import type { EntityKind } from '@rotp/game-data';

const recommendationFile = (kind: EntityKind): string => `recommendations/${kind}.json`;

export { recommendationFile };
