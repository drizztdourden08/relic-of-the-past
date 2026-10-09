/* @layer shared-game-data @kind logic */
import { AMBIENT_ROLES } from './ambient-reach.constants';

const isAmbientReachable = (id: number): boolean => AMBIENT_ROLES.has(id);

export { isAmbientReachable };
