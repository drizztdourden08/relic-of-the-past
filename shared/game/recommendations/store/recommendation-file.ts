/* @layer shared-game @kind logic */
import type { EntityKind } from '../../data/types';

const recommendationFile = (kind: EntityKind): string => `recommendations/${kind}.json`;

export { recommendationFile };
