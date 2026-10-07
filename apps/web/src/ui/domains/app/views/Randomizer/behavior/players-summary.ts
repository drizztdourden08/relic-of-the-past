/* @layer renderer-components @kind logic */
/** The room's players in one line: how many are online, how many the room has not said, and who has finished. */
import type { NetworkPlayer } from '@app/lib/game/randomizer-client';

const playersSummaryOf = (players: readonly NetworkPlayer[]): string => {
  const online = players.filter((player) => player.online === true).length;
  const unknown = players.filter((player) => player.online === null).length;
  const finished = players.filter((player) => player.status === 'goal').length;
  const parts = [`${online} of ${players.length} online`];
  if (unknown > 0) parts.push(`${unknown} not reported`);
  if (finished > 0) parts.push(`${finished} completed their goal`);
  return parts.join(', ');
};

export { playersSummaryOf };
