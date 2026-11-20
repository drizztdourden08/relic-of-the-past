/* @layer bridge-wasm @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
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

const HANDLER_LABELS: Readonly<Record<number, Message>> = {
  [PlayerState.fallingIntoHole]: msg('game-states:handler.fallingIntoHole'),
  [PlayerState.recoilWall]: msg('game-states:handler.recoilWall'),
  [PlayerState.spinAttacking]: msg('game-states:handler.spinAttacking'),
  [PlayerState.swimming]: msg('game-states:handler.swimming'),
  [PlayerState.recoilOther]: msg('game-states:handler.recoilOther'),
  [PlayerState.fallOffLedge]: msg('game-states:handler.fallOffLedge'),
  [PlayerState.jumpOffLedgeDiag]: msg('game-states:handler.jumpOffLedgeDiag'),
  [PlayerState.startDash]: msg('game-states:handler.startDash'),
  [PlayerState.stopDash]: msg('game-states:handler.stopDash'),
  [PlayerState.hookshot]: msg('game-states:handler.hookshot'),
  [PlayerState.mirror]: msg('game-states:handler.mirror'),
  [PlayerState.holdUpItem]: msg('game-states:handler.holdUpItem'),
  [PlayerState.asleepInBed]: msg('game-states:handler.asleepInBed'),
  [PlayerState.permaBunny]: msg('game-states:handler.permaBunny'),
  [PlayerState.tempBunny]: msg('game-states:handler.tempBunny'),
  [PlayerState.pullForRupees]: msg('game-states:handler.pullForRupees'),
  [PlayerState.spinAttackMotion]: msg('game-states:handler.spinAttackMotion'),
};

const PROGRESS_BITS: ReadonlyArray<ProgressBit> = [
  { mask: 0x01, label: msg('game-states:progress.uncleSword') },
  { mask: 0x02, label: msg('game-states:progress.sanctuary') },
  { mask: 0x04, label: msg('game-states:progress.uncleLeft') },
  { mask: 0x10, label: msg('game-states:progress.uncleHouse') },
  { mask: 0x20, label: msg('game-states:progress.desertSage') },
];

export { PlayerState, HANDLER_LABELS, PROGRESS_BITS };
