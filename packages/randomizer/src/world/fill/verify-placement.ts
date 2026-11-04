/* @layer shared-game @kind logic */
import { sweepPlacementSpheres as sweepWorldSpheres } from '@drizztdourden08/brock-randomizer/world';
import type { World } from '../world.type';
import type { PlacementSweep } from './fill.type';

const sweepPlacementSpheres = (world: World): PlacementSweep => sweepWorldSpheres(world);

export { sweepPlacementSpheres };
