/* @layer renderer-appshell @kind data */
import type { TesseraOverrides } from '@drizztdourden08/tessera/primitives';
import type { ViewStorage } from '@drizztdourden08/tessera/data';
import { loadViewSnapshot, saveViewSnapshot } from '../../lib/storage/ui-views';

const TESSERA_OVERRIDES: TesseraOverrides = {};

const ELECTRON_VIEW_STORAGE: ViewStorage = { load: loadViewSnapshot, save: saveViewSnapshot };

export { ELECTRON_VIEW_STORAGE, TESSERA_OVERRIDES };
