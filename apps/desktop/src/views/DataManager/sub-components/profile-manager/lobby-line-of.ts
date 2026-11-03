/* @layer renderer-components @kind logic */
import { freeSeats } from '@rotp/randomizer';
import type { LobbyCheck } from '@app/game/archipelia';
import type { LobbyLineState } from '@app/compounds/LobbySetup';

const lobbyLineOf = (check: LobbyCheck): LobbyLineState =>
  (check.kind === 'ok' ? { kind: 'ok', name: check.name, ap: check.ap, approval: check.approval, seats: freeSeats(check.seats), ...(check.open === undefined ? {} : { open: check.open }) } : check);

export { lobbyLineOf };
