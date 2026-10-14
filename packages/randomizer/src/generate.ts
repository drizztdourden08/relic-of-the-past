/* @layer shared-game @kind logic */
import { generatePlacement } from './world/fill/generate';
import type { GenerateRequest } from './world/fill/fill.type';
import type { Placement } from './world/fill/placement.type';

const generateFromSnapshot = (request: GenerateRequest): Placement => generatePlacement(request);

export { generateFromSnapshot };
