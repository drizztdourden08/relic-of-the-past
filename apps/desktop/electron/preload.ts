/* @layer electron-preload @kind entry */
import { parse } from 'path';
import { BASE_EVENT_MAP, BASE_INVOKE_MAP, BASE_SEND_MAP, composeMaps } from '@drizztdourden08/brock-core';
import { createPreloadBridge } from '@drizztdourden08/brock-electron/preload';
import { preloadNamespaces } from '../.brock/modules.preload';
import { APP_EVENT_MAP, APP_INVOKE_MAP, APP_SEND_MAP } from '../src/ipc/contract.constants';
import type { AppHelpers } from '../src/ipc/app-api.type';
import { updaterNamespace } from './preload-namespaces/updater-namespace';
import { shadowCastingNamespace } from './preload-namespaces/shadow-casting-namespace';
import { screenEditorNamespace } from './preload-namespaces/screen-editor-namespace';

const helpers: AppHelpers = {
  getSpritesBaseUrl: (romFile) => `app-sprite://sprites/${parse(romFile).name}/`,
};

createPreloadBridge({
  maps: {
    invoke: composeMaps(BASE_INVOKE_MAP, APP_INVOKE_MAP),
    send: composeMaps(BASE_SEND_MAP, APP_SEND_MAP),
    events: composeMaps(BASE_EVENT_MAP, APP_EVENT_MAP),
  },
  namespaces: [...preloadNamespaces, updaterNamespace, shadowCastingNamespace, screenEditorNamespace],
  helpers: { ...helpers },
  debugGlobal: { name: '__relicDebug', values: { forceAspect: process.env.RELIC_FORCE_ASPECT || null } },
});
