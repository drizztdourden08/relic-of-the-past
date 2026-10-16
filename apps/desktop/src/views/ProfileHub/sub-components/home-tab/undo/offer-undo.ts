/* @layer renderer-components @kind logic */
import { toast } from '@drizztdourden08/tessera/composites';
import { UNDO_LABEL, UNDO_WINDOW_MS } from '../home-tab.constants';
import { runQuietly } from './run-quietly';
import type { UndoOffer } from './undo.type';

const offerUndo = (offer: UndoOffer): void => {
  const { id, message, undo } = offer;
  toast({
    id,
    message,
    duration: UNDO_WINDOW_MS,
    action: { label: UNDO_LABEL, onSelect: () => void runQuietly(undo, 'undo the change') },
  });
};

export { offerUndo };
