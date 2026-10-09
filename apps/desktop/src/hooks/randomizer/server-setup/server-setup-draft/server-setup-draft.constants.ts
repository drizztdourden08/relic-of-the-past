/* @layer renderer-lib @kind constants */
import { DEFAULT_SLOT_NAME } from '@app/lib/game/randomizer-client/online-config-of-profile';
import { ARCHIPELAGO_DEFAULT_PORT } from '@shared/config/ports.constants';
import type { ServerSetupDraft } from './server-setup-draft.type';

const DEFAULT_PORT = String(ARCHIPELAGO_DEFAULT_PORT);

const EMPTY_SERVER_SETUP: ServerSetupDraft = { host: '', port: DEFAULT_PORT, password: '', slotName: DEFAULT_SLOT_NAME };

export { DEFAULT_PORT, EMPTY_SERVER_SETUP };
