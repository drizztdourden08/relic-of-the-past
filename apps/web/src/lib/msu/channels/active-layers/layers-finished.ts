/* @layer renderer-lib @kind logic */
import type { ActiveLayer } from '../channel.type';

const layersFinished = (layers: ActiveLayer[]): boolean => layers.every((entry) => {
  const activity = entry.scheduler.activity();
  return !activity.sounding && activity.nextEventInSeconds === null;
});

export { layersFinished };
