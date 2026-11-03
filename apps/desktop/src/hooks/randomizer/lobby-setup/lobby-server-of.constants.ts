/* @layer renderer-lib @kind constants */
import { foundServerOf } from './found-server-of';
import type { LobbyConnect } from './lobby-draft.type';
import type { ServerStrategy } from './lobby-server-of.type';
import { typedServerOf } from './typed-server-of';

const SERVER_STRATEGIES: Readonly<Record<LobbyConnect, ServerStrategy>> = {
  auto: foundServerOf,
  manual: typedServerOf,
};

export { SERVER_STRATEGIES };
