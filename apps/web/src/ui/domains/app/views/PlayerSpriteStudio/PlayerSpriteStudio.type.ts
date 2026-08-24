/* @layer renderer-components @kind types */
import type { RomDisplayInfo } from '../../../../../App/types';

type StudioView = 'state' | 'contact' | 'sheet';

interface PlayerSpriteStudioProps {
  romStatuses: RomDisplayInfo[];
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export type { StudioView, PlayerSpriteStudioProps };
