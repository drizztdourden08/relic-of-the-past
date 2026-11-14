/* @layer renderer-app @kind types */
import type { TouchControlsSettings } from '@rotp/features';
import type { InputBinding } from '@rotp/game-data';

interface TouchBindBoardProps {
  touch: TouchControlsSettings;
  current: InputBinding | null;
  onPick: (binding: InputBinding) => void;
}

export type { TouchBindBoardProps };
