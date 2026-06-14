/* @layer renderer-widgets @kind types */
import type { ScreenDefinition } from '@shared/game/types';

interface ScreenEditorProps {
  open: boolean;
  onClose: () => void;
  existingScreen: ScreenDefinition | null;
  gameState: {
    roomIndex: number;
    palaceIndex: number;
    isIndoors: boolean;
    isDarkWorld: boolean;
  };
}

export type { ScreenEditorProps };
