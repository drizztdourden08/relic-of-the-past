/* @layer bridge-wasm @kind logic */
import type { RosterName } from '../players-reply';
import type { OnlineRoom } from '../online-room';

const othersOf = (room: OnlineRoom): RosterName[] => room.players
  .filter((player) => player.team === (room.team ?? 0) && player.slot !== room.slot)
  .map(({ slot, name }) => ({ slot, name }));

export { othersOf };
