/* @layer renderer-components @kind component */
import { Text } from '@ds/primitives';
import { DashboardPanel } from '@ds/composites';
import { PlayersTable } from './NetworkTab';
import { playersSummaryOf } from '../behavior/players-summary';
import { EMPTY, WAITING } from './RunPlayers.constants';
import type { RunPlayersProps } from './RunPlayers.type';

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
