/* @layer electron-main @kind logic */
import { emit, getMainWindow, handle } from '@drizztdourden08/brock-electron/main';
import { createLanDiscovery } from './create-lan-discovery';

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
};

export { registerLanHandlers };
