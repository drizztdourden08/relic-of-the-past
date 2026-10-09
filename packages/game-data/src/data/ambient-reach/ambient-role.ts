/* @layer shared-game-data @kind logic */
import type { AmbientRole } from './ambient-reach.type';
import { AMBIENT_ROLES } from './ambient-reach.constants';

const ambientRole = (id: number): AmbientRole | null => AMBIENT_ROLES.get(id) ?? null;

export { ambientRole };
