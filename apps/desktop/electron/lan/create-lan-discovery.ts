/* @layer electron-main @kind logic */
import type { LanDiscoverySettings, LanSighting } from '@rotp/randomizer';
import { browseMdns } from './browse-mdns';
import { listenBeacons } from './listen-beacons';

type LanDiscovery = {
  start: (settings: LanDiscoverySettings) => void;
  stop: () => void;
};

const createLanDiscovery = (report: (sighting: LanSighting) => void): LanDiscovery => {
  let stops: (() => void)[] = [];

  const stop = (): void => {
    for (const close of stops) close();
    stops = [];
  };

  const start = (settings: LanDiscoverySettings): void => {
    stop();
    stops = [browseMdns(settings, report), listenBeacons(settings.beaconPort, report)];
  };

  return { start, stop };
};

export { createLanDiscovery };
export type { LanDiscovery };
