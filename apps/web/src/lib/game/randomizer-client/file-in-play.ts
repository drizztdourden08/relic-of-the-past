/* @layer bridge-wasm @kind logic */
/**
 * Whether a save file is in play, and when the save under the game changes.
 *
 * In play means the game left the title modules (the intro, file select, copy, erase, naming
 * and the attract demo: the UI mode 'title'). Choosing a file copies it into the save block
 * before the game leaves them (CopySaveToWRAM), so from then on the bytes the host keeps in the
 * save (the received index, the room hash) are that file's. Before it they are whatever the
 * last file left, or zeros.
 *
 * The save changes on a state load, on entering a file from the title, and on the way back to
 * the title (a save and quit, a reset): each fires onSaveSwap.
 */
import { useGameUIStore } from '../../../stores/game-ui-store';
import { onStateLoaded } from '../state-load-signal';

const isFileInPlay = (): boolean => useGameUIStore.getState().mode !== 'title';

const onSaveSwap = (listener: () => void): (() => void) => {
  let inPlay = isFileInPlay();
  const unsubscribeStore = useGameUIStore.subscribe((state) => {
    const next = state.mode !== 'title';
    if (next === inPlay) return;
    inPlay = next;
    listener();
  });
  const unsubscribeLoad = onStateLoaded(listener);
  return () => {
    unsubscribeStore();
    unsubscribeLoad();
  };
};

export { isFileInPlay, onSaveSwap };
