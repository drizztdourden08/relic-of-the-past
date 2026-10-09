/* @layer bridge-wasm @kind logic */
import { scoutedTextsState } from './scouted-texts-state';

const stopScoutedTexts = (): void => {
  scoutedTextsState.active?.stop();
  scoutedTextsState.active = null;
};

export { stopScoutedTexts };
