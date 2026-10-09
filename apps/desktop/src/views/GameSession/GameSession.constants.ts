/* @layer renderer-appshell @kind constants */
import type { ViewStorage } from '@drizztdourden08/tessera/data';
import { loadViewSnapshot, saveViewSnapshot } from '@app/storage/ui-views';

const TITLEBAR_HEIGHT = 38;

const HOME_HUB = 'game';

const GAME_CONTEXT = 'game';

const DATA_INSPECTOR_SCREEN = 'data-inspector';

const DATA_VIEW_STORAGE: ViewStorage = { load: loadViewSnapshot, save: saveViewSnapshot };

export { DATA_INSPECTOR_SCREEN, DATA_VIEW_STORAGE, GAME_CONTEXT, HOME_HUB, TITLEBAR_HEIGHT };
