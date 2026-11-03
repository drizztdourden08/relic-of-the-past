/* @layer renderer-components @kind component */
import { Field, SectionHeader, Stack } from '@drizztdourden08/tessera/primitives';
import { connectModeOf } from '@app/hooks/randomizer/lobby-setup';
import type { ConnectionSectionProps } from '../LobbySetup.type';
import { ConnectMode } from './ConnectMode';
import { LobbyCodeField } from './LobbyCodeField';
import { LobbyRows } from './LobbyRows';
import { RemoteAddress } from './RemoteAddress';

const ConnectionSection = ({ value, onChange, lobbies, lobby, disabled }: ConnectionSectionProps) => {
  const mode = connectModeOf(value);

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
          picked={value.joinToken}
          disabled={disabled}
          onPick={(row) => onChange({ joinToken: row.id, lobbyServer: row.address })}
        />
      ) : (
        <>
          <Field label="Address">
            <RemoteAddress value={value.address} disabled={disabled} onChange={(address) => onChange({ address })} />
          </Field>
          <LobbyCodeField
            value={value.code} error={lobby.kind === 'error' ? lobby.text : undefined} disabled={disabled}
            onChange={(code) => onChange({ code })}
          />
        </>
      )}
    </Stack>
  );
};

export { ConnectionSection };
