/* @layer shared-game @kind types */
import type { RoomInteractables, SimDoor, SimObservation, SimSprite } from '../../types';
import type { Reached } from '../discover-reach/discover-reach.type';
import type { RoomThreat } from '../enemy-reach/enemy-reach.type';
import type { EngineState } from '../state/state.type';
import type { EVENT_STEPS } from './discover.constants';

interface DiscoverScope {
  state: EngineState;
  obs: SimObservation;
  reached: Reached;
  inter: RoomInteractables;
  screenId: string;
  owScreen: number | null;
  killGated: boolean;
  shutters: SimDoor[];
  threat: RoomThreat;
  living: SimSprite[];
  trapArm: boolean;
  hasBombs: boolean;
  hasSword: boolean;
}

type LockedDoorKind = 'small-key' | 'big-key' | 'bombable';

type EventStep = (typeof EVENT_STEPS)[number];

export type { DiscoverScope, LockedDoorKind, EventStep };
