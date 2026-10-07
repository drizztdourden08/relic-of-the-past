/* @layer renderer-components @kind component */
/**
 * The Run tab, the run at a glance as a dashboard: what the run is, how far it has come and
 * the last few moments that mattered share the top row, then the room's players (Archipelago
 * only; a local seed's one player is the progress itself), then a summary of the options it was
 * generated with (the full list is the Options tab). Where each
 * panel sits is RUN_PANELS. A normal profile (or none) gets a quiet empty state instead, since
 * there is nothing to say about a run that isn't one.
 */
import { Box, EmptyState } from '@ds/primitives';
import { DashboardGrid, DashboardPanel } from '@ds/composites';
import { RunSummary } from './RunSummary';
import { RunProgress } from './RunProgress';
import { RunPlayers } from './RunPlayers';
import { RecentActivity } from './RecentActivity';
import { OptionsSummary } from './OptionsSummary';
import { useNetworkStatus } from './NetworkTab';
import { NOT_RANDOMIZED, RUN_PANELS } from '../Randomizer.constants';
import type { ActivityLogProps } from './ActivityLog';
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import type { ActiveSession, SessionSource } from '@app/lib/game/randomizer-client';

interface RunTabProps {
  profileId: string | null;
  profileName: string | null;
  config: ProfileRandomizerConfig | null;
  session: ActiveSession | null;
  source: SessionSource | null;
  status: ActiveSession['status'];
  gameRunning: boolean;
  /** The activity feed, for the recent activity. */
  log: ActivityLogProps;
  /** Archipelago only: the status pill opens the Network tab. */
  onOpenNetwork: () => void;
  /** The options summary's button opens the Options tab. */
  onOpenOptions: () => void;
  /** The recent activity's button opens the Logs tab. */
  onOpenLog: () => void;
}

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
        profileId={profileId}
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
