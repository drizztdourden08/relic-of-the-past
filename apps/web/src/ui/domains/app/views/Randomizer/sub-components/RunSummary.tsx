/* @layer renderer-components @kind component */
/**
 * The facts of the run on the Run tab's dashboard: the live session state as the header's
 * chip, then which profile it belongs to, the seed it was generated from and, once a local
 * session has armed, the plan counters it armed with, all as tiles. An Archipelago run adds its
 * connection tiles, a one-line network status that opens the Network tab, and the button that
 * saves its files. The frozen options are summed up by OptionsSummary and listed on the Options
 * tab; the placement is the spoiler tab's.
 */
import { Chip, Text } from '@ds/primitives';
import { DashboardPanel, StatTileGrid } from '@ds/composites';
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import type { ActiveSession, SessionSource } from '@app/lib/game/randomizer-client';
import { counterTilesOf, summaryTilesOf } from '../behavior/run-summary-tiles';
import { sessionToneOf } from '../behavior/session-tone';
import { ArchipelagoFiles } from './ArchipelagoFiles';
import { NetworkPill } from './NetworkTab';
import type { PanelPlacement } from '../Randomizer.constants';

interface RunSummaryProps {
  placement: PanelPlacement;
  profileId: string;
  profileName: string;
  config: ProfileRandomizerConfig;
  session: ActiveSession | null;
  source: SessionSource | null;
  status: ActiveSession['status'];
  gameRunning: boolean;
  onOpenNetwork: () => void;
}

const RunSummary = (props: RunSummaryProps) => {
  const { placement, profileId, profileName, config, session, source, status, gameRunning, onOpenNetwork } = props;
  const archipelago = config.mode === 'online';
  const counters = counterTilesOf(session?.kind === 'local' ? session.stats : null);

  return (
    <DashboardPanel {...placement} title="Summary" action={<Chip tone={sessionToneOf(status)} caps>{status}</Chip>}>
      {archipelago && <NetworkPill onOpen={onOpenNetwork} />}
      <StatTileGrid tiles={summaryTilesOf(profileName, config, source)} />
      {counters.length > 0 && <StatTileGrid tiles={counters} />}
      {archipelago && <ArchipelagoFiles profileId={profileId} />}
      {!session && !gameRunning && (
        <Text className="randomizer-page__hint">The session starts automatically when the game boots.</Text>
      )}
    </DashboardPanel>
  );
};

export { RunSummary };
export type { RunSummaryProps };
