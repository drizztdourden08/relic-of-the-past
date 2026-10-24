/* @layer electron-main @kind logic */
import { handle } from '@drizztdourden08/brock-electron/main';
import { saveArchipelagoFiles } from './save-files/save-archipelago-files';

const registerArchipelagoHandlers = (): void => {
  handle('archipelago:save-files', (_event, request) => saveArchipelagoFiles(request));
};

export { registerArchipelagoHandlers };
