/* @layer renderer-components @kind component */
/**
 * The Run tab's players, for an Archipelago run: one line under the title on who is online and
 * who has finished, then the Network tab's players table, compact: each player with their game,
 * an online or offline chip and their checks done where known. The Network tab holds the full
 * table, with slots and client statuses.
 */
import { Text } from '@ds/primitives';
import { DashboardPanel } from '@ds/composites';
import { PlayersTable } from './NetworkTab';
import { playersSummaryOf } from '../behavior/players-summary';
import type { NetworkPlayer } from '@app/lib/game/randomizer-client';
import type { PanelPlacement } from '../Randomizer.constants';

interface RunPlayersProps {
  placement: PanelPlacement;
  /** The room's players; null before the session connects. */
  players: readonly NetworkPlayer[] | null;
}

const WAITING = 'The players show once the session connects to the room.';
const EMPTY = 'No players yet.';

const RunPlayers = ({ placement, players }: RunPlayersProps) => {
  if (players === null || players.length === 0) {
    return (
      <DashboardPanel {...placement} title="Players">
        <Text className="randomizer-page__hint">{players === null ? WAITING : EMPTY}</Text>
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel {...placement} title="Players" subtitle={playersSummaryOf(players)}>
      <PlayersTable players={players} compact />
    </DashboardPanel>
  );
};

export { RunPlayers };
export type { RunPlayersProps };
