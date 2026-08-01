/* @layer renderer-widgets @kind types */
import type { ScreenRecord } from '@shared/game/data';

interface ScreenEditorProps {
  open: boolean;
  onClose: () => void;
  /** The dataset record being edited, or null when creating one. */
  existingScreen: ScreenRecord | null;
  gameState: {
    /** Native indoor room index. */
    roomIndex: number;
    /** Native overworld screen index, in the unified 0x00-0x7F space. */
    overworldIndex: number;
    palaceIndex: number;
    isIndoors: boolean;
    isDarkWorld: boolean;
  };
}

export type { ScreenEditorProps };
