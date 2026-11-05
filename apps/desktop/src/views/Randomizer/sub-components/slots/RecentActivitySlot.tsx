/* @layer renderer-components @kind component */
import { useNavigation } from '@drizztdourden08/brock-react';
import { useRandomizerSession } from '../../behavior/useRandomizerSession';
import { useRoomMessages } from '../../behavior/useRoomMessages';
import { RANDOMIZER_BUCKET, RUN_PANELS } from '../../Randomizer.constants';
import { RecentActivity } from '../RecentActivity';

const RecentActivitySlot = () => {
  const { open } = useNavigation();
  const { session, entries } = useRandomizerSession();
  const roomLines = useRoomMessages(session);
  return (
    <RecentActivity
      placement={RUN_PANELS.activity}
      entries={entries}
      roomLines={roomLines}
      onOpenLog={() => open(`${RANDOMIZER_BUCKET}/logs`)}
    />
  );
};

export { RecentActivitySlot };
