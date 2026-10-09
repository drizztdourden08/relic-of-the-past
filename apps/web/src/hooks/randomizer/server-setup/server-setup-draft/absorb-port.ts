/* @layer renderer-lib @kind logic */
import { splitServerAddress } from '@app/lib/game/randomizer-client/server-address';
import type { ServerSetupDraft } from './server-setup-draft.type';

const absorbPort = (draft: ServerSetupDraft): ServerSetupDraft => {
  const { host, port } = splitServerAddress(draft.host);
  return port === '' ? draft : { ...draft, host, port };
};

export { absorbPort };
