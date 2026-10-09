/* @layer shared-game @kind types */
import type { GridPos } from '../../navigation/types';

type TriggerAction =
  | { type: 'chest'; roomId: number; chestIndex: number; itemId: number }
  | { type: 'npc'; flagType: number; flagMask: number; itemId: number }
  | { type: 'overworld'; screen: number; mask: number; itemId: number }
  | { type: 'boss'; roomId: number; itemId: number; prizeId: number }
  | { type: 'door'; roomId: number; doorIndex: number; doorKind: 'small-key' | 'big-key' | 'bombable'; cellLock?: boolean }
  | { type: 'kill'; roomId: number; itemId: number; opensShutters: boolean }
  | { type: 'trapShutters'; roomId: number }
  | { type: 'bombWall'; roomId: number; tile: GridPos }
  | { type: 'pullSwitch'; roomId: number; drain?: { screen: number; mask: number } }
  | { type: 'progress'; step: 'follower-join' | 'follower-deliver' | 'shelf-push' | 'sage-quest' };

export type { TriggerAction };
