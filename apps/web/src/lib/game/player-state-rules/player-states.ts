/* @layer bridge-wasm @kind logic */
import type { PlayerStateInfo } from '../bridge/player-state';
import type { ActiveState } from '../active-states';
import { HANDLER_LABELS, PROGRESS_BITS, PlayerState } from './player-state-rules.constants';

const playerActivity = (info: PlayerStateInfo): ActiveState | null => {
  if (info.handlerState === PlayerState.asleepInBed) {
    const waking = info.sleepStep > 0;
    return {
      id: 'asleep',
      label: waking ? 'Waking up in bed' : 'Asleep in bed',
      ...(waking ? { detail: `wake step ${info.sleepStep}` } : {}),
    };
  }
  const label = HANDLER_LABELS[info.handlerState];
  if (label) return { id: 'activity', label };
  return null;
};

const dashState = (info: PlayerStateInfo): ActiveState | null => (info.isRunning
  ? { id: 'dashing', label: 'Dashing (boots)', gating: true }
  : null);

const bunnyState = (info: PlayerStateInfo): ActiveState | null => (info.isBunny
  ? { id: 'bunny', label: 'Bunny - cannot use items', gating: true }
  : null);

const waterState = (info: PlayerStateInfo): ActiveState | null => (info.inDeepWater
  ? { id: 'deep-water', label: 'In deep water', gating: true }
  : null);

const wallState = (info: PlayerStateInfo): ActiveState | null => (info.grabbingWall
  ? { id: 'grabbing-wall', label: 'Grabbing a wall' }
  : null);

const stunnedState = (info: PlayerStateInfo): ActiveState | null => (info.incapacitated
  ? { id: 'stunned', label: 'Stunned' }
  : null);

const progressBitStates = (info: PlayerStateInfo): ActiveState[] =>
  PROGRESS_BITS
    .filter((bit) => (info.progressFlags & bit.mask) !== 0)
    .map((bit) => ({ id: `progress-flag-${bit.mask}`, label: bit.label, hint: `sram_progress_flags 0x${bit.mask.toString(16).padStart(2, '0')}` }));

const playerStates = (info: PlayerStateInfo | null): ActiveState[] => {
  if (!info) return [];
  const single = [playerActivity(info), dashState(info), bunnyState(info), waterState(info), wallState(info), stunnedState(info)];
  return [...single.filter((s): s is ActiveState => s !== null), ...progressBitStates(info)];
};

export { playerStates };
