/* @layer renderer-components @kind logic */
import { BEND_COST, MIDDLE_COST, OPTION_LIMIT } from '../PadOverlay.constants';
import type { Point } from '../PadOverlay.type';
import { leaderRoutes } from './leader-routes';
import { middleSpots } from './middle-spots';
import type { LabelOption, LabelSize, Scene, Segment } from './placement.type';
import { routeClear } from './route-clear';
import { sideSpots } from './side-spots';

const segmentsOf = (route: readonly Point[]): Segment[] =>
  route.slice(1).map((point, index): Segment => [route[index] ?? point, point]);

const lengthOf = (segments: readonly Segment[]): number => segments.reduce((sum, [a, b]) => sum + Math.hypot(b.x - a.x, b.y - a.y), 0);

const labelOptions = (own: number, size: LabelSize, scene: Scene, fontPx: number): LabelOption[] => {
  const part = scene.parts[own];
  if (!part) return [];
  const spots = [...sideSpots(size, scene), ...middleSpots(part, size, scene, fontPx)];
  const options = spots.flatMap((spot) => leaderRoutes(part, spot.attach).flatMap((leader) => {
    const segments = segmentsOf(leader);
    if (!routeClear(segments, own, spot.rect, scene)) return [];
    const cost = lengthOf(segments) + (leader.length - 2) * BEND_COST + (spot.middle ? MIDDLE_COST : 0);
    return [{ spot, leader, segments, cost }];
  }));
  return options.sort((a, b) => a.cost - b.cost).slice(0, OPTION_LIMIT);
};

export { labelOptions };
