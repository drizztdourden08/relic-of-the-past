/* @layer renderer-components @kind component */
import { EmptyState, Grid } from '@drizztdourden08/tessera/primitives';
import { DashboardCard } from './DashboardCard';
import { PANEL_MIN_WIDTH } from './StatTiles.constants';
import { RunSummary } from './RunSummary';
import { RunProgress } from './RunProgress';
import { RunPlayers } from './RunPlayers';
import { RecentActivity } from './RecentActivity';
import { OptionsSummary } from './OptionsSummary';
import { useNetworkStatus } from './NetworkTab';
import { NO_RUN_PANEL, NOT_RANDOMIZED, RUN_PANELS } from '../Randomizer.constants';
import type { RunTabProps } from './RunTab.type';

const RunTab = (props: RunTabProps) => {
  const {
    profileId, profileName, config, session, source, status, gameRunning, log,
    onOpenNetwork, onOpenOptions, onOpenLog,
  } = props;
  const { status: network } = useNetworkStatus();

  if (!config || !profileId || !profileName) {
    return (
      <Grid minColWidth={PANEL_MIN_WIDTH} gap="lg" dense>
        <DashboardCard title="Run" placement={NO_RUN_PANEL}>
          <EmptyState message={profileName ? NOT_RANDOMIZED : 'No active profile.'} />
        </DashboardCard>
      </Grid>
    );
  }

  return (
    <Grid minColWidth={PANEL_MIN_WIDTH} gap="lg" dense>
      <RunSummary
        placement={RUN_PANELS.summary}
        profileName={profileName}
        config={config}
        session={session}
        source={source}
        status={status}
        gameRunning={gameRunning}
        onOpenNetwork={onOpenNetwork}
      />
      <RunProgress placement={RUN_PANELS.progress} room={network?.progress ?? null} />
      <RecentActivity placement={RUN_PANELS.activity} entries={log.entries} roomLines={log.roomLines} onOpenLog={onOpenLog} />
      {config.mode === 'online' && <RunPlayers placement={RUN_PANELS.players} players={network?.players ?? null} />}
      <OptionsSummary
        pool={RUN_PANELS.pool}
        settings={RUN_PANELS.settings}
        options={config.options}
        seed={config.seed}
        onOpenOptions={onOpenOptions}
      />
    </Grid>
  );
};

export { RunTab };
export type { RunTabProps };
