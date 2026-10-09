/* @layer shared-game @kind logic */
import type { Route, RouteStep } from '../../../pathfinding/types/route.type';
import { gameNumberOf } from './game-number-of';

const toRoute = (path: string[]): Route => {
  const steps: RouteStep[] = path.map(id => ({ screen: gameNumberOf(id), path: [] }));
  return { steps, totalCost: Math.max(0, path.length - 1), screens: steps.map(s => s.screen), requirements: [] };
};

export { toRoute };
