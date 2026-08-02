/* @layer electron-main @kind logic */
/**
 * Data Inspector / table view state — a whole-file, app-level JSON map, the
 * same shape and location precedent as connection-review.json and
 * nav-review.json (getUserDataPath, NOT under profiles/). The renderer
 * debounces before calling, so this handler is a plain read/write.
 */
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
