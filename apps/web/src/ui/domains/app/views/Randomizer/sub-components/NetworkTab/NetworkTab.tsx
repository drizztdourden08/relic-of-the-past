/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Grid, Text } from '@drizztdourden08/tessera/primitives';
import { DashboardCard } from '../DashboardCard';
import { PANEL_MIN_WIDTH } from '../StatTiles.constants';
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
  const view = useMemo(() => networkViewOf(status, last, config), [status, last, config]);

  return frame(
    <Grid minColWidth={PANEL_MIN_WIDTH} gap="lg" dense className="network-tab">
      <DashboardCard placement={NETWORK_PANELS.setup} title="Server setup">
        {config === null
          ? <Text className="randomizer-page__hint">No Archipelago profile is open.</Text>
          : <ConnectionEditor config={config} sessionError={status?.connection.error ?? null} onSave={onSaveConnection} />}
      </DashboardCard>
      <ConnectionSection placement={NETWORK_PANELS.connection} view={view} now={now} />
      <HealthSection placement={NETWORK_PANELS.health} view={view} now={now} />
      <ProgressSection placement={NETWORK_PANELS.progress} view={view} />
      <PlayersSection placement={NETWORK_PANELS.players} view={view} />
      <ServerSection placement={NETWORK_PANELS.server} view={view} />
    </Grid>,
    NETWORK_ANCHORS,
  );
};

export { NetworkTab };
