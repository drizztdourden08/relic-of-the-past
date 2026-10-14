/* @layer renderer-hud @kind hook */
import { strokeWidthsOf, TILE_PX } from '@rotp/game-data';
import type { DialogFrame } from '@rotp/game-data';
import type { DialogBoxSettings } from '../../../stores/dialog-settings-store';
import { SPAWN_PICKER_MESSAGES } from '../DialogView.constants';
import type { DialogChrome } from '../DialogView.type';
import { ringOf } from './ring-of';
import { useOpeningMessage } from './useOpeningMessage';

const useDialogChrome = (frame: DialogFrame, look: DialogBoxSettings): DialogChrome => {
  const openingMessage = useOpeningMessage(frame);
  const spawnPicker = frame.kind === 'box' && SPAWN_PICKER_MESSAGES.has(openingMessage);
  const borderKind = spawnPicker ? 'none' : look.border;

  const ring = ringOf(borderKind, strokeWidthsOf(look.borderThickness));
  const drawn = borderKind === 'single' || borderKind === 'double';
  const styled = frame.kind === 'box' && borderKind !== 'original';
  const padX = styled ? ring + (look.cornerMark !== 'none' && drawn ? 11 : 6) : TILE_PX;
  const padY = styled ? ring + 2 : TILE_PX;
  const native = frame.kind === 'menu' || frame.kind === 'story';

  return { openingMessage, spawnPicker, borderKind, padX, padY, native };
};

export { useDialogChrome };
