/* @layer electron-main @kind logic */
import { emit, getMainWindow, handle } from '@drizztdourden08/brock-electron/main';
import { allowFirewall } from './allow-firewall';
import { createLanDiscovery } from './create-lan-discovery';
import { readFirewallStatus } from './read-firewall-status';

const registerLanHandlers = (): void => {
  const discovery = createLanDiscovery((sighting) => {
    const win = getMainWindow();
    if (win) emit(win, 'lan:sighting', sighting);
  });

  handle('lan:discovery:start', (_event, settings) => {
    discovery.start(settings);
    return Promise.resolve();
  });

  handle('lan:discovery:stop', () => {
    discovery.stop();
    return Promise.resolve();
  });

  handle('lan:firewall:status', () => readFirewallStatus());

  handle('lan:firewall:allow', () => allowFirewall());
};

export { registerLanHandlers };
