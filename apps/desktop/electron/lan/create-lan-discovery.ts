/* @layer electron-main @kind logic */
import type { LanSighting } from '@rotp/randomizer';
import { browseMdns } from './browse-mdns';
import type { LanDiscovery } from './create-lan-discovery.type';
import { listenBeacons } from './listen-beacons';

const createLanDiscovery = (report: (sighting: LanSighting) => void): LanDiscovery => {
  let stops: (() => void)[] = [];

  const stop = (): void => {
    for (const close of stops) close();
    stops = [];
  };

  const start: LanDiscovery['start'] = (settings) => {
    stop();
    stops = [browseMdns(settings, report), listenBeacons(settings.beaconPort, report)];
  };

  return { start, stop };
};

export { createLanDiscovery };
