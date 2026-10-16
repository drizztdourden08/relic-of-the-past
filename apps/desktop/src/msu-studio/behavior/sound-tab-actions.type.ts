/* @layer renderer-components @kind types */
import type { SoundPanelController } from '../msu.type';

type SoundTabActionsParams = {
  sound: SoundPanelController;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
};

export type { SoundTabActionsParams };
