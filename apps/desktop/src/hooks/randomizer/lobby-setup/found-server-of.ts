/* @layer renderer-lib @kind logic */
import type { ServerStrategy } from './lobby-server-of.type';

const foundServerOf: ServerStrategy = (draft) => draft.lobbyServer;

export { foundServerOf };
