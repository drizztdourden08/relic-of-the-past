/* @layer renderer-components @kind component */
import { Fragment } from 'react';
import { Box, EmptyState, Icon, Stack, Status } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import type { LobbyRow, LobbyRowsProps } from '../LobbySetup.type';

const metaOf = (lobby: LobbyRow): string => {
  if (!lobby.supported) return 'No build';
  return lobby.open ? lobby.address : 'No lobby';
};

const LobbyRows = ({ lobbies, picked, onPick, pickedExtra, disabled }: LobbyRowsProps) => (
  <Stack gap="2xs" className="lobby-setup__rows">
    {lobbies.length === 0 && <EmptyState message="No lobbies found." />}
    {lobbies.map((lobby) => (
      <Fragment key={lobby.id}>
        <ListItemRow
          className={lobby.open ? undefined : 'lobby-setup__row--closed'}
          icon={<Icon name="server" />}
          name={lobby.name}
          meta={metaOf(lobby)}
          selected={picked === lobby.id}
          onClick={disabled ? undefined : () => onPick(lobby.id)}
          action={lobby.ap === undefined ? undefined : <Status tone={lobby.supported ? 'success' : 'warning'} variant="pill">{`AP ${lobby.ap}`}</Status>}
          actionVisibility="always"
        />
        {picked === lobby.id && <Box className="lobby-setup__picked-extra">{pickedExtra}</Box>}
      </Fragment>
    ))}
  </Stack>
);

export { LobbyRows };
