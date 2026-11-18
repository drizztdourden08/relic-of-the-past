/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Field, Flex, SectionHeader, Stack } from '@drizztdourden08/tessera/primitives';
import { connectModeOf } from '@app/hooks/randomizer/lobby-setup';
import type { ConnectionSectionProps } from '../LobbySetup.type';
import { ConnectMode } from './ConnectMode';
import { LobbyCodeField } from './LobbyCodeField';
import { LobbyRows } from './LobbyRows';
import { NetworkWarning } from './NetworkWarning';
import { RefreshButton } from './RefreshButton';
import { RemoteAddress } from './RemoteAddress';

const ConnectionSection = ({ value, onChange, lobbies, lobby, access, disabled }: ConnectionSectionProps) => {
  const t = useT();
  const mode = connectModeOf(value);

  return (
    <Stack gap="sm" className="lobby-setup__connection">
      <SectionHeader
        title={t('compounds:lobby-setup.connection')}
        level={4}
        action={(
          <Flex gap="sm" align="center">
            {mode === 'auto' && access && <RefreshButton access={access} disabled={disabled} />}
            <ConnectMode mode={mode} location={value.location} disabled={disabled} onChange={(connect) => onChange({ connect })} />
          </Flex>
        )}
      />
      {mode === 'auto' ? (
        <>
          <LobbyRows
            lobbies={lobbies}
            picked={value.joinToken}
            disabled={disabled}
            onPick={(row) => onChange({ joinToken: row.id, lobbyServer: row.address })}
          />
          {access?.blocked && <NetworkWarning onAllow={access.onAllow} />}
        </>
      ) : (
        <>
          <Field label={t('compounds:lobby-setup.address')}>
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
