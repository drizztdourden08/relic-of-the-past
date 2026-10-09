/* @layer electron-main @kind logic */
import { handle } from '../lib/ipc/handle';
import { getUserDataPath } from '../lib/paths';
import { readJson, writeJson } from '../lib/json-store';

const registerUiViewsHandlers = (): void => {
  handle('uiViews:load', () =>
    readJson(getUserDataPath('ui-views.json'), {}));

  handle('uiViews:save', (_e, data) =>
    writeJson(getUserDataPath('ui-views.json'), data));
};

export { registerUiViewsHandlers };
