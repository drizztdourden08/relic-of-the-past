/* @layer electron-main @kind logic */
import { handle } from '../lib/ipc/handle';
import { getUserDataPath } from '../lib/paths';
import { readJson, writeJson } from '../lib/json-store';

const registerConnectionHandlers = (): void => {
  handle('connectionReview:load', () =>
    readJson(getUserDataPath('connection-review.json'), {}));

  handle('connectionReview:save', (_e, data: unknown) =>
    writeJson(getUserDataPath('connection-review.json'), data));

  // Nav review data (per-screen connection point reviews with comments)
  handle('navReview:load', () =>
    readJson(getUserDataPath('nav-review.json'), {}));

  handle('navReview:save', (_e, data: unknown) =>
    writeJson(getUserDataPath('nav-review.json'), data));
};

export { registerConnectionHandlers };
