/* @layer renderer-components @kind component */
import { Status, Text } from '@drizztdourden08/tessera/primitives';
import { summaryTilesOf } from '../behavior/run-summary-tiles';
import { counterTilesOf } from '../behavior/counter-tiles';
import { sessionToneOf } from '../behavior/session-tone';
import { NetworkPill } from './NetworkTab';
import { DashboardCard } from './DashboardCard';
import { StatTiles } from './StatTiles';
import type { RunSummaryProps } from './RunSummary.type';

const RunSummary = (props: RunSummaryProps) => {
  const { placement, profileName, config, session, source, status, gameRunning, onOpenNetwork } = props;
  const archipelago = config.mode === 'online';
  const counters = counterTilesOf(session?.kind === 'local' ? session.stats : null);
  const state = <Status tone={sessionToneOf(status)} variant="pill" dot>{status}</Status>;

  return (
    <DashboardCard placement={placement} title="Summary" actions={state}>
      {archipelago && <NetworkPill onOpen={onOpenNetwork} />}
      <StatTiles tiles={summaryTilesOf(profileName, config, source)} />
      {counters.length > 0 && <StatTiles tiles={counters} />}
      {!session && !gameRunning && (
        <Text className="randomizer-page__hint">Waiting for the game to start.</Text>
      )}
    </DashboardCard>
  );
};

export { RunSummary };
