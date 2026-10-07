/* @layer renderer-components @kind component */
/**
 * The Randomizer page's Network tab, for an Archipelago profile, as a dashboard: the server
 * setup with its Test connection, then the connection, its health, this slot's progress, the
 * room's players and the server's rules, all live from the online session
 * (behavior/useNetworkStatus.ts). With the game stopped every panel still stands: the setup
 * stays editable, and the rest show the last session's picture on this connection, marked as
 * such, or say they fill in once the game connects. Where each panel sits is NETWORK_PANELS.
 */
import { Text } from '@ds/primitives';
import { DashboardGrid, DashboardPanel } from '@ds/composites';
import { useNetworkStatus } from './behavior/useNetworkStatus';
import { networkViewOf } from './behavior/network-view';
import { ConnectionEditor } from './sub-components/ConnectionEditor';
import { ConnectionSection } from './sub-components/ConnectionSection';
import { HealthSection } from './sub-components/HealthSection';
import { ProgressSection } from './sub-components/ProgressSection';
import { PlayersSection } from './sub-components/PlayersSection';
import { ServerSection } from './sub-components/ServerSection';
import { NETWORK_ANCHORS, NETWORK_PANELS } from '../../Randomizer.constants';
import type { NetworkTabProps } from './NetworkTab.type';
import './NetworkTab.css';

const NetworkTab = ({ config, onSaveConnection, frame }: NetworkTabProps) => {
  const { status, last, now } = useNetworkStatus();
  const view = networkViewOf(status, last, config);

  return frame(
    <DashboardGrid className="network-tab">
      <DashboardPanel {...NETWORK_PANELS.setup} title="Server setup">
        {config === null
          ? <Text className="randomizer-page__hint">No Archipelago profile is open.</Text>
          : <ConnectionEditor config={config} sessionError={status?.connection.error ?? null} onSave={onSaveConnection} />}
      </DashboardPanel>
      <ConnectionSection placement={NETWORK_PANELS.connection} view={view} now={now} />
      <HealthSection placement={NETWORK_PANELS.health} view={view} now={now} />
      <ProgressSection placement={NETWORK_PANELS.progress} view={view} />
      <PlayersSection placement={NETWORK_PANELS.players} view={view} />
      <ServerSection placement={NETWORK_PANELS.server} view={view} />
    </DashboardGrid>,
    NETWORK_ANCHORS,
  );
};

export { NetworkTab };
