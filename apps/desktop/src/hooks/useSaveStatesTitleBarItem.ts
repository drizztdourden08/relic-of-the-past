/* @layer renderer-app @kind hook */
import type { TitleBarItemSpec } from '@drizztdourden08/brock-react';
import { useOptionalGameSession } from './useOptionalGameSession';

const useSaveStatesTitleBarItem = (): TitleBarItemSpec | null => {
  const session = useOptionalGameSession();
  if (!session?.game.isRunning) return null;
  return { kind: 'button', label: 'Save States', icon: 'save', onSelect: session.saveOverlay.toggle };
};

export { useSaveStatesTitleBarItem };
