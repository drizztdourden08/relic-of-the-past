/* @layer shared-game @kind constants */
import { createWorldKit } from '@drizztdourden08/brock-randomizer/world';
import type { RotpKeys } from './rotp-keys.type';

const ROTP_WORLD_KIT = createWorldKit<RotpKeys>();

export { ROTP_WORLD_KIT };
