/* @layer renderer-lib @kind logic */
import type { ActiveLayer } from '../channel.type';

const stopLayers = (layers: ActiveLayer[]): void => {
  for (const entry of layers) {
    entry.scheduler.stop();
    entry.gain.disconnect();
    entry.effects.dispose();
  }
};

export { stopLayers };
