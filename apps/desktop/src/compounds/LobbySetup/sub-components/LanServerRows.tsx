/* @layer renderer-components @kind component */
import { EmptyState, Icon, Stack, Status } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import type { LanServerRow, LanServerRowsProps } from '../LobbySetup.type';

const versionStatus = (server: LanServerRow) => {
  if (!server.supported) return <Status tone="warning" variant="pill">{`AP ${server.ap} · No build`}</Status>;
  return <Status tone={server.open ? 'success' : 'neutral'} variant="pill">{server.open ? `AP ${server.ap}` : `AP ${server.ap} · No lobby`}</Status>;
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
        meta={server.address}
        selected={picked === server.id}
        onClick={disabled ? undefined : () => onPick(server.id)}
        action={versionStatus(server)}
        actionVisibility="always"
      />
    ))}
  </Stack>
);

export { LanServerRows };
