/* @layer renderer-components @kind hook */
/**
 * Follows the Archipelago room's messages while an online session is live.
 * A local session or no session reads as an empty list.
 */
import { useEffect, useState } from 'react';
import type { ActiveSession, RoomMessage } from '../../../../../../lib/game/randomizer-client';

const NO_LINES: readonly RoomMessage[] = [];

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
