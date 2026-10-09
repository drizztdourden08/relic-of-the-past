/* @layer shared-game @kind types */
import type { GridPos } from '../../../navigation/types';
import type { CheckId } from '@rotp/game-data';
import type { SimDoor } from '../../types';
import type { TraversalId } from '../../traversal-id.type';

interface ObservedCheck {
  checkId: CheckId | null;
  screenId: TraversalId;
  roomId: number;
  tile: GridPos;
}

interface ObservedTransition {
  from: TraversalId;
  to: TraversalId;
}

interface ObservedDoorGate {
  roomId: number;
  kind: SimDoor['kind'];
  direction: SimDoor['direction'];
  opened: boolean;
}

interface RecorderState {
  checks: ObservedCheck[];
  transitions: ObservedTransition[];
  doorGates: ObservedDoorGate[];
}

export type { ObservedCheck, ObservedTransition, ObservedDoorGate, RecorderState };
