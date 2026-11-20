/* @layer bridge-wasm @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { PlayerStateInfo } from '../bridge/player-state';
import type { ActiveState } from '../active-states';
import { HANDLER_LABELS, PROGRESS_BITS, PlayerState } from './player-state-rules.constants';

const playerActivity = (info: PlayerStateInfo): ActiveState | null => {
  if (info.handlerState === PlayerState.asleepInBed) {
    const waking = info.sleepStep > 0;
    return {
      id: 'asleep',
      label: waking ? msg('game-states:state.waking') : msg('game-states:state.asleep'),
      ...(waking ? { detail: msg('game-states:state.wakeStep', { step: info.sleepStep }) } : {}),
    };
  }
  const label = HANDLER_LABELS[info.handlerState];
  if (label) return { id: 'activity', label };
  return null;
};

const dashState = (info: PlayerStateInfo): ActiveState | null => (info.isRunning
  ? { id: 'dashing', label: msg('game-states:state.dashing'), gating: true }
  : null);

const bunnyState = (info: PlayerStateInfo): ActiveState | null => (info.isBunny
  ? { id: 'bunny', label: msg('game-states:state.bunny'), gating: true }
  : null);

const waterState = (info: PlayerStateInfo): ActiveState | null => (info.inDeepWater
  ? { id: 'deep-water', label: msg('game-states:state.deepWater'), gating: true }
  : null);

const wallState = (info: PlayerStateInfo): ActiveState | null => (info.grabbingWall
  ? { id: 'grabbing-wall', label: msg('game-states:state.wall') }
  : null);

const stunnedState = (info: PlayerStateInfo): ActiveState | null => (info.incapacitated
  ? { id: 'stunned', label: msg('game-states:state.stunned') }
  : null);

const progressBitStates = (info: PlayerStateInfo): ActiveState[] =>
  PROGRESS_BITS
    .filter((bit) => (info.progressFlags & bit.mask) !== 0)
    .map((bit) => ({ id: `progress-flag-${bit.mask}`, label: bit.label, hint: msg('game-states:state.progressHint', { mask: `0x${bit.mask.toString(16).padStart(2, '0')}` }) }));

const playerStates = (info: PlayerStateInfo | null): ActiveState[] => {
  if (!info) return [];
  const single = [playerActivity(info), dashState(info), bunnyState(info), waterState(info), wallState(info), stunnedState(info)];
  return [...single.filter((s): s is ActiveState => s !== null), ...progressBitStates(info)];
};

export { playerStates };
