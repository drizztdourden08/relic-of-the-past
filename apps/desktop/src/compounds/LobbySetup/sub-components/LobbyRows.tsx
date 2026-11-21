/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { EmptyState, Icon, Stack, Status } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { NO_LOBBIES_HINT } from '../LobbySetup.constants';
import type { LobbyRow, LobbyRowsProps } from '../LobbySetup.type';

const LobbyRows = ({ lobbies, picked, onPick, disabled }: LobbyRowsProps) => {
  const t = useT();
  const text = useText();
  const metaOf = (lobby: LobbyRow): string => {
    if (!lobby.supported) return t('compounds:lobby-setup.row.no-build', { address: lobby.address });
    return [lobby.address, lobby.seats, lobby.open ? '' : t('compounds:lobby-setup.row.closed')].filter((part) => part !== '').join(', ');
  };

  return (
    <Stack gap="2xs" className="lobby-setup__rows">
      {lobbies.length === 0 && <EmptyState message={text(NO_LOBBIES_HINT)} />}
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
            action={lobby.ap === undefined ? undefined : <Status tone={lobby.supported ? 'success' : 'warning'} variant="pill">{t('compounds:lobby-setup.row.ap-version', { version: lobby.ap })}</Status>}
            actionVisibility="always"
          />
        );
      })}
    </Stack>
  );
};

export { LobbyRows };
