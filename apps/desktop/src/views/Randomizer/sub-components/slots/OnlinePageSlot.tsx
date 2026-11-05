/* @layer renderer-components @kind component */
import { EmptyState } from '@drizztdourden08/tessera/primitives';
import { useGameSession } from '@app/hooks/useGameSession';
import { NOT_ARCHIPELAGO } from '../../Randomizer.constants';
import { OnlineTab } from '../OnlineTab';

const OnlinePageSlot = () => {
  const { activeProfile } = useGameSession().profileMgmt;
  if (activeProfile?.randomizer?.mode !== 'online') return <EmptyState message={NOT_ARCHIPELAGO} />;
  return <OnlineTab profile={activeProfile} />;
};

export { OnlinePageSlot };
