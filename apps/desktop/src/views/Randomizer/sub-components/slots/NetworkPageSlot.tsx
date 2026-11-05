/* @layer renderer-components @kind component */
import { EmptyState } from '@drizztdourden08/tessera/primitives';
import { useGameSession } from '@app/hooks/useGameSession';
import { useProfileConnection } from '@app/hooks/randomizer/useProfileConnection';
import { NOT_ARCHIPELAGO } from '../../Randomizer.constants';
import { NetworkTab } from '../NetworkTab';

const NetworkPageSlot = () => {
  const { activeProfile } = useGameSession().profileMgmt;
  const { config, saveConnection } = useProfileConnection(activeProfile);
  if (config?.mode !== 'online') return <EmptyState message={NOT_ARCHIPELAGO} />;
  return <NetworkTab config={config} onSaveConnection={saveConnection} />;
};

export { NetworkPageSlot };
