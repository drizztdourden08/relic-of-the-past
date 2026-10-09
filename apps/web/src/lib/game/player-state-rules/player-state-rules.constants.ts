/* @layer bridge-wasm @kind constants */
import type { ProgressBit } from './player-state-rules.type';

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

const PROGRESS_BITS: ReadonlyArray<ProgressBit> = [
  { mask: 0x01, label: 'Uncle gave the sword' },
  { mask: 0x02, label: 'Sanctuary priest scene seen' },
  { mask: 0x04, label: 'Uncle left for the castle' },
  { mask: 0x10, label: "Uncle's house scene done" },
  { mask: 0x20, label: 'Desert sage spoken to' },
];

export { PlayerState, HANDLER_LABELS, PROGRESS_BITS };
