/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import type { ActiveSession, RoomMessage } from '../../../game/randomizer-client';
import { NO_LINES } from './useRoomMessages.constants';

const useRoomMessages = (session: ActiveSession | null): readonly RoomMessage[] => {
  const [lines, setLines] = useState<readonly RoomMessage[]>(NO_LINES);

  useEffect(() => {
    if (session?.kind !== 'online') {
      setLines(NO_LINES);
      return undefined;
    }
    setLines(session.messages);
    return session.onMessages(setLines);
  }, [session]);

  return lines;
};

export { useRoomMessages };
