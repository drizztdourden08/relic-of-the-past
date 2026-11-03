/* @layer renderer-components @kind component */
import { Field, SectionHeader, Stack } from '@drizztdourden08/tessera/primitives';
import { connectModeOf, LOCAL_LOBBY_ID } from '@app/hooks/randomizer/lobby-setup';
import type { ConnectionSectionProps } from '../LobbySetup.type';
import { ConnectMode } from './ConnectMode';
import { LobbyCodeField } from './LobbyCodeField';
import { LobbyRows } from './LobbyRows';
import { RemoteAddress } from './RemoteAddress';

const ConnectionSection = ({ value, onChange, lobbies, lobby, disabled }: ConnectionSectionProps) => {
  const mode = connectModeOf(value);
  const code = (
    <LobbyCodeField
      value={value.code} error={lobby.kind === 'error' ? lobby.text : undefined} disabled={disabled}
      onChange={(next) => onChange({ code: next })}
    />
  );

  return (
    <Stack gap="sm" className="lobby-setup__connection">
      <SectionHeader
        title="Connection"
        level={4}
        action={<ConnectMode mode={mode} location={value.location} disabled={disabled} onChange={(connect) => onChange({ connect })} />}
      />
      {mode === 'auto' ? (
        <LobbyRows
          lobbies={lobbies}
          picked={value.location === 'local' ? LOCAL_LOBBY_ID : value.lobbyId}
          pickedExtra={code}
          disabled={disabled}
          onPick={(lobbyId) => onChange({ lobbyId })}
        />
      ) : (
        <>
          <Field label="Address">
            <RemoteAddress value={value.address} disabled={disabled} onChange={(address) => onChange({ address })} />
          </Field>
          {code}
        </>
      )}
    </Stack>
  );
};

export { ConnectionSection };
