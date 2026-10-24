/* @layer renderer-components @kind component */
import { EmptyState, Icon, Stack, Status } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import type { LanServerRow, LanServerRowsProps } from '../LobbySetup.type';

const metaOf = (server: LanServerRow): string => {
  if (!server.supported) return 'No build';
  return server.open ? server.address : 'No lobby';
};

const LanServerRows = ({ servers, picked, onPick, disabled }: LanServerRowsProps) => (
  <Stack gap="2xs" className="lobby-setup__lan">
    {servers.length === 0 && <EmptyState message="No servers found." />}
    {servers.map((server) => (
      <ListItemRow
        key={server.id}
        className={server.open ? undefined : 'lobby-setup__lan-row--closed'}
        icon={<Icon name="server" />}
        name={server.name}
        meta={metaOf(server)}
        selected={picked === server.id}
        onClick={disabled ? undefined : () => onPick(server.id)}
        action={<Status tone={server.supported ? 'success' : 'warning'} variant="pill">{`AP ${server.ap}`}</Status>}
        actionVisibility="always"
      />
    ))}
  </Stack>
);

export { LanServerRows };
