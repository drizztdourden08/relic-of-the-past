/* @layer bridge-wasm @kind logic */
import { useGameUIStore } from '../../../../stores/game-ui-store';

const isFileInPlay = (): boolean => useGameUIStore.getState().mode !== 'title';

export { isFileInPlay };
