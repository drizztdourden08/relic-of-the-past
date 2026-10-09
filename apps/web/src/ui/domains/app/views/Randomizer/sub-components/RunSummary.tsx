/* @layer renderer-components @kind component */
import { Chip, Text } from '@ds/primitives';
import { DashboardPanel, StatTileGrid } from '@ds/composites';
import { summaryTilesOf } from '../behavior/run-summary-tiles';
import { counterTilesOf } from '../behavior/counter-tiles';
import { sessionToneOf } from '../behavior/session-tone';
import { NetworkPill } from './NetworkTab';
import type { RunSummaryProps } from './RunSummary.type';

const RunSummary = (props: RunSummaryProps) => {
  const { placement, profileName, config, session, source, status, gameRunning, onOpenNetwork } = props;
  const archipelago = config.mode === 'online';
  const counters = counterTilesOf(session?.kind === 'local' ? session.stats : null);

  return (
    <DashboardPanel {...placement} title="Summary" action={<Chip tone={sessionToneOf(status)} caps>{status}</Chip>}>
      {archipelago && <NetworkPill onOpen={onOpenNetwork} />}
      <StatTileGrid tiles={summaryTilesOf(profileName, config, source)} />
      {counters.length > 0 && <StatTileGrid tiles={counters} />}
      {!session && !gameRunning && (
        <Text className="randomizer-page__hint">The session starts automatically when the game boots.</Text>
      )}
    </DashboardPanel>
  );
};

export { RunSummary };
export type { RunSummaryProps };
