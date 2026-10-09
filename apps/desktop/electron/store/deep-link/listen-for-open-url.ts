/* @layer electron-main @kind logic */
import { app } from 'electron';
import { parseInstallLink } from '@shared/store/deep-link';
import { deliverInstallLink } from './deliver-install-link';

const listenForOpenUrl = (): void => {
  app.on('open-url', (event, url) => {
    event.preventDefault();
    const link = parseInstallLink(url);
    if (link) deliverInstallLink(link);
  });
};

export { listenForOpenUrl };
