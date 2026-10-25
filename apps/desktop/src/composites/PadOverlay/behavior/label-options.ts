/* @layer renderer-components @kind logic */
import { BEND_COST, END_COST, OPTION_LIMIT } from '../PadOverlay.constants';
import type { Point } from '../PadOverlay.type';
import { endSpots } from './end-spots';
import { leaderRoutes } from './leader-routes';
import { partSides } from './part-sides';
import type { LabelOption, LabelSize, LabelSpot, Scene, Segment } from './placement.type';
import { routeClear } from './route-clear';
import { sideSpots } from './side-spots';

const segmentsOf = (route: readonly Point[]): Segment[] =>
  route.slice(1).map((point, index): Segment => [route[index] ?? point, point]);

const lengthOf = (segments: readonly Segment[]): number => segments.reduce((sum, [a, b]) => sum + Math.hypot(b.x - a.x, b.y - a.y), 0);

const zoneCost = (spot: LabelSpot): number => (spot.zone === 'above' || spot.zone === 'below' ? END_COST : 0);

const labelOptions = (own: number, size: LabelSize, scene: Scene, fontPx: number): LabelOption[] => {
  const part = scene.parts[own];
  if (!part) return [];
  const spots = [...sideSpots(size, scene, partSides(part, scene)), ...endSpots(part, size, scene, fontPx)];
  const options = spots.flatMap((spot) => leaderRoutes(part, spot.elbow).flatMap((leader) => {
    const segments = segmentsOf(leader);
    if (!routeClear(segments, own, spot.rect, scene)) return [];
    const cost = lengthOf(segments) + (leader.length - 2) * BEND_COST + zoneCost(spot);
    return [{ spot, leader, segments, cost }];
  }));
  return options.sort((a, b) => a.cost - b.cost).slice(0, OPTION_LIMIT);
};

export { labelOptions };
