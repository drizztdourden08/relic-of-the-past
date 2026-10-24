/* @layer renderer-components @kind component */
import { Flex, Spinner, Status, Text } from '@drizztdourden08/tessera/primitives';
import type { LobbyLineProps } from '../LobbySetup.type';

const LobbyLine = ({ state }: LobbyLineProps) => {
  if (state.kind === 'checking') return <Spinner size="sm" />;
  if (state.kind !== 'ok') return null;
  return (
    <Flex gap="sm" align="center" wrap className="lobby-setup__line">
      <Text weight={600}>{state.name}</Text>
      <Status tone="success" variant="pill">{`Archipelago ${state.ap}`}</Status>
      {state.approval && <Status tone="neutral" variant="pill">Host approval</Status>}
    </Flex>
  );
};

export { LobbyLine };
