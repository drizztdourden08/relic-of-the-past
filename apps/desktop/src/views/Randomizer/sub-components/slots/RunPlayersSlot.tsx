/* @layer renderer-components @kind component */
import { useGameSession } from '@app/hooks/useGameSession';
import { useProfileConnection } from '@app/hooks/randomizer/useProfileConnection';
import { RUN_PANELS } from '../../Randomizer.constants';
import { RunPlayers } from '../RunPlayers';
import { useNetworkStatus } from '../NetworkTab';

const RunPlayersSlot = () => {
  const { activeProfile } = useGameSession().profileMgmt;
  const { config } = useProfileConnection(activeProfile);
  const { status } = useNetworkStatus();
  if (config?.mode !== 'online') return null;
  return <RunPlayers placement={RUN_PANELS.players} players={status?.players ?? null} />;
};

export { RunPlayersSlot };
