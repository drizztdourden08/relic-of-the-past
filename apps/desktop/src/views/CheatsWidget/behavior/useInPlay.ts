/* @layer renderer-widgets @kind hook */
import { useGameUIStore } from '@app/stores/game-ui-store';
import { PLAY_MODULES } from '../CheatsWidget.constants';

const useInPlay = (): boolean => useGameUIStore((s) => PLAY_MODULES.has(s.gameMode.mainModule) && s.gameMode.subModule === 0);

export { useInPlay };
