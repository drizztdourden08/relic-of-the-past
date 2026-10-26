/* @layer renderer-components @kind logic */
import type { LobbyCheck } from '@app/game/archipelia';
import type { LobbyLineState } from '@app/compounds/LobbySetup';

const lobbyLineOf = (check: LobbyCheck): LobbyLineState =>
  (check.kind === 'ok' ? { kind: 'ok', name: check.name, ap: check.ap, approval: check.approval } : check);

export { lobbyLineOf };
