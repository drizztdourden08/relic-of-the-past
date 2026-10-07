/* @layer renderer-components @kind types */
import type { RomDisplayInfo } from '../../../../../App/types';

interface PlayerSpriteStudioProps {
  romStatuses: RomDisplayInfo[];
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export type { PlayerSpriteStudioProps };
