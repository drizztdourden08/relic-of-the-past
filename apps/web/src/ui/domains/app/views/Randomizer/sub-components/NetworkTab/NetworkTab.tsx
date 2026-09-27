/* @layer renderer-components @kind component */
/**
 * The Randomizer page's Network tab, for an Archipelago profile: the connection, its health,
 * the room's players, the server's rules and this slot's progress, all live from the online
 * session (behavior/useNetworkStatus.ts). With no session it says where it would connect.
 * The profile's connection is editable from the Connection section, session or not.
 */
import { Box, Text } from '@ds/primitives';
import { useNetworkStatus } from './behavior/useNetworkStatus';
import { ConnectionSection } from './sub-components/ConnectionSection';
import { ConnectionEditor } from './sub-components/ConnectionEditor';
import { NetworkSection } from './sub-components/NetworkSection';
import { HealthSection } from './sub-components/HealthSection';
import { PlayersSection } from './sub-components/PlayersSection';
import { ServerSection } from './sub-components/ServerSection';
import { ProgressSection } from './sub-components/ProgressSection';
import type { NetworkTabProps } from './NetworkTab.type';
import './NetworkTab.css';

const NetworkTab = ({ config, onSaveConnection }: NetworkTabProps) => {
  const { status, now } = useNetworkStatus();
  const editor = (error: string | null) => config && (
    <ConnectionEditor config={config} error={error} onSave={onSaveConnection} />
  );

  if (status === null) {
    return (
      <Box className="randomizer-page__scroll network-tab">
        <NetworkSection title="Connection">
          <Text className="randomizer-page__hint">
            {`Not connected. The session connects to ${config?.serverUrl ?? 'the server'} when the game boots.`}
          </Text>
          {editor(null)}
        </NetworkSection>
      </Box>
    );
  }

  return (
    <Box className="randomizer-page__scroll network-tab">
      <ConnectionSection connection={status.connection} now={now}>
        {editor(status.connection.error)}
      </ConnectionSection>
      <HealthSection status={status} now={now} />
      <PlayersSection players={status.players} />
      <ProgressSection progress={status.progress} />
      <ServerSection server={status.server} />
    </Box>
  );
};

export { NetworkTab };
