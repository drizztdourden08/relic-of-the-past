/* @layer renderer-app @kind hook */
import { useT } from '@drizztdourden08/brock-react';
import type { TitleBarItemSpec } from '@drizztdourden08/brock-react';
import { useOptionalGameSession } from './useOptionalGameSession';

const useSaveStatesTitleBarItem = (): TitleBarItemSpec | null => {
  const session = useOptionalGameSession();
  const t = useT();
  if (!session?.game.isRunning) return null;
  return { kind: 'button', label: t('views-game-layer:menu.save-states'), icon: 'save', onSelect: session.saveOverlay.toggle };
};

export { useSaveStatesTitleBarItem };
