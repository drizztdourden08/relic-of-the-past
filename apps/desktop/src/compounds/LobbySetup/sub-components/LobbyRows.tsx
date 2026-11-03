/* @layer renderer-components @kind component */
import { EmptyState, Icon, Stack, Status } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { NO_LOBBIES_HINT } from '../LobbySetup.constants';
import type { LobbyRow, LobbyRowsProps } from '../LobbySetup.type';

const metaOf = (lobby: LobbyRow): string => {
  if (!lobby.supported) return `No build, ${lobby.address}`;
  return [lobby.address, lobby.seats, lobby.open ? '' : 'Closed'].filter((part) => part !== '').join(', ');
};

const LobbyRows = ({ lobbies, picked, onPick, disabled }: LobbyRowsProps) => (
  <Stack gap="2xs" className="lobby-setup__rows">
    {lobbies.length === 0 && <EmptyState message={NO_LOBBIES_HINT} />}
    {lobbies.map((lobby) => {
      const joinable = lobby.open && lobby.supported;
      return (
        <ListItemRow
          key={lobby.id}
          className={joinable ? undefined : 'lobby-setup__row--closed'}
          icon={<Icon name="server" />}
          name={lobby.name}
          meta={metaOf(lobby)}
          selected={picked === lobby.id}
          onClick={disabled || !joinable ? undefined : () => onPick(lobby)}
          action={lobby.ap === undefined ? undefined : <Status tone={lobby.supported ? 'success' : 'warning'} variant="pill">{`AP ${lobby.ap}`}</Status>}
          actionVisibility="always"
        />
      );
    })}
  </Stack>
);

export { LobbyRows };
