/* @layer renderer-other @kind logic */
import { BASE_EVENT_MAP, BASE_INVOKE_MAP, BASE_SEND_MAP, composeMaps, detectHost } from '@drizztdourden08/brock-core';
import { installApiShim } from '@drizztdourden08/brock-react';
import { APP_EVENT_MAP, APP_INVOKE_MAP, APP_SEND_MAP } from '@app/ipc/contract.constants';
import { EMPTY_ARRAY_METHODS, SCREEN_EDITOR_STUB, STUB_RETURNS } from './api-shim.constants';
import { eventStub } from './event-stub';
import { readNativeAppVersion } from './read-native-app-version';

const updaterStub = {
  capabilities: async () => ({ canCheck: false, canInstall: false }),
  openReleasePage: async () => {},
  check: async () => null,
  getAvailable: async () => null,
  listVersions: async () => [],
  apply: async () => {},
  getPrefs: async () => ({ allowPrerelease: false }),
  setPrefs: async () => {},
  getVersion: readNativeAppVersion,
  onUpdateAvailable: eventStub,
  onUpToDate: eventStub,
  onDownloadProgress: eventStub,
  onDownloadComplete: eventStub,
  onError: eventStub,
};

const shadowCastingStub = { load: async () => null, save: async () => {}, getScreen: async () => null };

const installAppShim = (): void => {
  if (detectHost() === 'electron') return;
  installApiShim(
    {
      invoke: composeMaps(BASE_INVOKE_MAP, APP_INVOKE_MAP),
      send: composeMaps(BASE_SEND_MAP, APP_SEND_MAP),
      events: composeMaps(BASE_EVENT_MAP, APP_EVENT_MAP),
    },
    {
      listMethods: [...EMPTY_ARRAY_METHODS],
      returns: STUB_RETURNS,
      helpers: { getSpritesBaseUrl: () => '', updater: updaterStub, shadowCasting: shadowCastingStub, screenEditor: SCREEN_EDITOR_STUB },
    },
  );
};

export { installAppShim };
