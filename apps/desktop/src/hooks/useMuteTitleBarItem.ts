/* @layer renderer-app @kind hook */
import type { TitleBarItemSpec } from '@drizztdourden08/brock-react';
import { useOptionalGameSession } from './useOptionalGameSession';

const useMuteTitleBarItem = (): TitleBarItemSpec | null => {
  const session = useOptionalGameSession();
  if (!session) return null;
  const { isMuted, handleToggleMute } = session.audio;
  return { kind: 'button', label: isMuted ? 'Unmute' : 'Mute', icon: isMuted ? 'volume-x' : 'volume-2', onSelect: handleToggleMute };
};

export { useMuteTitleBarItem };
