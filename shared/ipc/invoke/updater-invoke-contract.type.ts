/* @layer shared-types @kind types */
import type { UpdateInfo, UpdaterCapabilities, UpdaterPrefs, VersionOption } from '../updater-contract';

interface UpdaterInvokeContract {
  'updater:capabilities': () => Promise<UpdaterCapabilities>;
  'updater:openReleasePage': (version: string | null) => Promise<void>;
  'updater:check': () => Promise<UpdateInfo | null>;
  'updater:getAvailable': () => Promise<UpdateInfo | null>;
  'updater:listVersions': () => Promise<VersionOption[]>;
  'updater:apply': (version: string | null) => Promise<void>;
  'updater:getPrefs': () => Promise<UpdaterPrefs>;
  'updater:setPrefs': (prefs: UpdaterPrefs) => Promise<void>;
  'updater:getVersion': () => Promise<string>;
}

export type { UpdaterInvokeContract };
