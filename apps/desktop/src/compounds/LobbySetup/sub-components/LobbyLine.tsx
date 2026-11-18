/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Flex, Spinner, Status, Text } from '@drizztdourden08/tessera/primitives';
import type { LobbyLineProps } from '../LobbySetup.type';

const LobbyLine = ({ state }: LobbyLineProps) => {
  const t = useT();
  if (state.kind === 'checking') return <Spinner size="sm" />;
  if (state.kind !== 'ok') return null;
  return (
    <Flex gap="sm" align="center" wrap className="lobby-setup__line">
      <Text weight={600}>{state.name}</Text>
      <Status tone="success" variant="pill">{t('compounds:lobby-setup.archipelago-version', { version: state.ap })}</Status>
      {state.open !== undefined && (
        <Status tone={state.open.free > 0 ? 'success' : 'neutral'} variant="pill">
          {t('compounds:lobby-setup.open-seats', { free: state.open.free, total: state.open.total })}
        </Status>
      )}
      {state.approval && <Status tone="neutral" variant="pill">{t('compounds:lobby-setup.host-approval')}</Status>}
    </Flex>
  );
};

export { LobbyLine };
