/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { PlayersTable } from './NetworkTab';
import { playersSummaryOf } from '../behavior/players-summary';
import { DashboardCard } from './DashboardCard';
import { EMPTY, WAITING } from './RunPlayers.constants';
import type { RunPlayersProps } from './RunPlayers.type';

const RunPlayers = ({ placement, players }: RunPlayersProps) => {
  if (players === null || players.length === 0) {
    return (
      <DashboardCard placement={placement} title="Players">
        <Text className="randomizer-page__hint">{players === null ? WAITING : EMPTY}</Text>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard placement={placement} title="Players" subtitle={playersSummaryOf(players)}>
      <PlayersTable players={players} compact />
    </DashboardCard>
  );
};

export { RunPlayers };
export type { RunPlayersProps };
