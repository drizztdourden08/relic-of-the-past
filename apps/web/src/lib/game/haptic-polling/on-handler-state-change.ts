/* @layer bridge-wasm @kind logic */
import { EnvironmentalEvent, handleEnvironmental, handleSpinAttack } from '@shared/input/haptics';
import { LEDGE_JUMP_STATES, PLAYER_STATE } from './haptic-polling.constants';

const onHandlerStateChange = (handlerState: number, prevHandlerState: number): void => {
  const entered = (state: number): boolean => handlerState === state && prevHandlerState !== state;

  if (entered(PLAYER_STATE.fallingIntoHole)) handleEnvironmental(EnvironmentalEvent.FALL_INTO_PIT);
  if (handlerState === PLAYER_STATE.ground && LEDGE_JUMP_STATES.includes(prevHandlerState)) {
    handleEnvironmental(EnvironmentalEvent.LAND_FROM_LEDGE);
  }
  if (entered(PLAYER_STATE.spinAttack)) handleSpinAttack();
  if (entered(PLAYER_STATE.swimming)) handleEnvironmental(EnvironmentalEvent.ENTER_WATER);
  if (entered(PLAYER_STATE.crossingWorlds)) handleEnvironmental(EnvironmentalEvent.MIRROR_WARP);
};

export { onHandlerStateChange };
