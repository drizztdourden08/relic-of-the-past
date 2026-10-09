/* @layer electron-main @kind logic */
import { handle, getUserDataPath, readJsonFile, writeJsonFile } from '@drizztdourden08/brock-electron/main';

const registerConnectionHandlers = (): void => {
  handle('connectionReview:load', () =>
    readJsonFile(getUserDataPath('connection-review.json'), {}));

  handle('connectionReview:save', (_e, data: unknown) =>
    writeJsonFile(getUserDataPath('connection-review.json'), data));

  handle('navReview:load', () =>
    readJsonFile(getUserDataPath('nav-review.json'), {}));

  handle('navReview:save', (_e, data: unknown) =>
    writeJsonFile(getUserDataPath('nav-review.json'), data));
};

export { registerConnectionHandlers };
