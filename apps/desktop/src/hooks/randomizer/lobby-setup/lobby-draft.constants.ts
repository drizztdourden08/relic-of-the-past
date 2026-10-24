/* @layer renderer-lib @kind constants */
import { LOBBY_DEFAULT_PORT } from '@rotp/randomizer';
import type { LobbyCheck } from '@app/game/archipelia';
import type { LobbyDraft } from './lobby-draft.type';

const LOCAL_HOST = 'localhost';

const EMPTY_LOBBY_DRAFT: LobbyDraft = {
  location: 'local',
  lanId: null,
  address: { kind: 'host', port: LOBBY_DEFAULT_PORT },
  code: {},
  slotName: '',
};

const HOST_NAME = /^(?=.{1,253}$)[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*$/i;

const OCTETS = ['a', 'b', 'c', 'd'] as const;

const CODE_HALF = 4;

const CHECK_DEBOUNCE_MS = 400;

const IDLE_CHECK: LobbyCheck = { kind: 'idle' };

export { CHECK_DEBOUNCE_MS, CODE_HALF, EMPTY_LOBBY_DRAFT, HOST_NAME, IDLE_CHECK, LOCAL_HOST, OCTETS };
