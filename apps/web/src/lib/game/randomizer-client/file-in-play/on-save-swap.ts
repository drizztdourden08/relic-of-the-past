/* @layer bridge-wasm @kind logic */
import { useGameUIStore } from '../../../../stores/game-ui-store';
import { onStateLoaded } from '../../state-load-signal';
import { isFileInPlay } from './is-file-in-play';

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

export { onSaveSwap };
