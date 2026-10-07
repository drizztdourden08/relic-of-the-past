/* @layer bridge-wasm @kind logic */
/**
 * State rules driven by live player-state bytes: what the player is doing, and the named story
 * bits in `sram_progress_flags`. `player_sleep_in_bed_state` is a step counter that is ZERO
 * while asleep, so "asleep" comes from the handler state and the counter only refines it.
 */
import type { PlayerStateInfo } from './bridge/player-state';
import type { ActiveState } from './active-states';

/** kPlayerState_* values this project names (player.h). */
const PlayerState = {
  ground: 0,
  fallingIntoHole: 1,
  recoilWall: 2,
  spinAttacking: 3,
  swimming: 4,
  recoilOther: 6,
  fallOffLedge: 12,
  jumpOffLedgeDiag: 14,
  startDash: 17,
  stopDash: 18,
  hookshot: 19,
  mirror: 20,
  holdUpItem: 21,
  asleepInBed: 22,
  permaBunny: 23,
  tempBunny: 28,
  pullForRupees: 29,
  spinAttackMotion: 30,
} as const;

/** Plain-English name per handler state. `ground` is the boring default. */
const HANDLER_LABELS: Readonly<Record<number, string>> = {
  [PlayerState.fallingIntoHole]: 'Falling into a hole',
  [PlayerState.recoilWall]: 'Knocked back by a wall',
  [PlayerState.spinAttacking]: 'Spin attacking',
  [PlayerState.swimming]: 'Swimming',
  [PlayerState.recoilOther]: 'Knocked back',
  [PlayerState.fallOffLedge]: 'Falling off a ledge',
  [PlayerState.jumpOffLedgeDiag]: 'Hopping a ledge',
  [PlayerState.startDash]: 'Starting a dash',
  [PlayerState.stopDash]: 'Ending a dash',
  [PlayerState.hookshot]: 'Using the hookshot',
  [PlayerState.mirror]: 'Using the mirror',
  [PlayerState.holdUpItem]: 'Holding an item overhead',
  [PlayerState.asleepInBed]: 'Asleep in bed',
  [PlayerState.permaBunny]: 'Bunny form',
  [PlayerState.tempBunny]: 'Bunny form (temporary)',
  [PlayerState.pullForRupees]: 'Pulling for rupees',
  [PlayerState.spinAttackMotion]: 'Spin attack follow-through',
};

/** `sram_progress_flags` bits, named from the routine that sets each. The mask travels as a tooltip hint so a doubted label can be traced to its byte. */
const PROGRESS_BITS: ReadonlyArray<{ mask: number; label: string }> = [
  { mask: 0x01, label: 'Uncle gave the sword' },
  { mask: 0x02, label: 'Sanctuary priest scene seen' },
  { mask: 0x04, label: 'Uncle left for the castle' },
  { mask: 0x10, label: "Uncle's house scene done" },
  { mask: 0x20, label: 'Desert sage spoken to' },
];

/** What the player is doing, when that is worth saying. */
const playerActivity = (info: PlayerStateInfo): ActiveState | null => {
  // Asleep is a handler state; the step counter says how far into waking he is.
  if (info.handlerState === PlayerState.asleepInBed) {
    return {
      id: 'asleep',
      label: info.sleepStep > 0 ? 'Waking up in bed' : 'Asleep in bed',
      ...(info.sleepStep > 0 ? { detail: `wake step ${info.sleepStep}` } : {}),
    };
  }
  const label = HANDLER_LABELS[info.handlerState];
  if (label) return { id: 'activity', label };
  return null;
};

/** Dashing is its own fact because the boots change what the player can cross. */
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
    // The mask is provenance, not chip text; it rides in the tooltip.
    .map((bit) => ({ id: `progress-flag-${bit.mask}`, label: bit.label, hint: `sram_progress_flags 0x${bit.mask.toString(16).padStart(2, '0')}` }));

/** Every state these bytes imply, in reading order. */
const playerStates = (info: PlayerStateInfo | null): ActiveState[] => {
  if (!info) return [];
  const single = [playerActivity(info), dashState(info), bunnyState(info), waterState(info), wallState(info), stunnedState(info)];
  return [...single.filter((s): s is ActiveState => s !== null), ...progressBitStates(info)];
};

export { playerStates, HANDLER_LABELS, PROGRESS_BITS, PlayerState };
