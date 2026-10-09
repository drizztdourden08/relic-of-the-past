/* @layer renderer-components @kind component */
import { EmptyState } from '@drizztdourden08/tessera/primitives';
import { DashboardGrid, DashboardPanel } from '@drizztdourden08/tessera/composites';
import { RunSummary } from './RunSummary';
import { RunProgress } from './RunProgress';
import { RunPlayers } from './RunPlayers';
import { RecentActivity } from './RecentActivity';
import { OptionsSummary } from './OptionsSummary';
import { useNetworkStatus } from './NetworkTab';
import { NOT_RANDOMIZED, RUN_PANELS } from '../Randomizer.constants';
import type { RunTabProps } from './RunTab.type';

const RunTab = (props: RunTabProps) => {
  const {
    profileId, profileName, config, session, source, status, gameRunning, log,
    onOpenNetwork, onOpenOptions, onOpenLog,
  } = props;
  const { status: network } = useNetworkStatus();

  if (!config || !profileId || !profileName) {
    return (
      <DashboardGrid>
        <DashboardPanel title="Run" span="full">
          <EmptyState message={profileName ? NOT_RANDOMIZED : 'No active profile.'} />
        </DashboardPanel>
      </DashboardGrid>
    );
  }

  return (
    <DashboardGrid>
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
    </DashboardGrid>
  );
};

export { RunTab };
export type { RunTabProps };
