/* @layer shared-game @kind logic */
import { generate } from '@drizztdourden08/brock-randomizer/world';
import { rotpWorldGame } from '../rotp-world-game';
import type { GenerateRequest } from './fill.type';
import type { Placement } from './placement.type';

const generatePlacement = (request: GenerateRequest): Placement => generate(rotpWorldGame, request);

export { generatePlacement };
