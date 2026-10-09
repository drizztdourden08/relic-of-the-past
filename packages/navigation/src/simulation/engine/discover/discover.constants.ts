/* @layer shared-game @kind constants */
import type { RoomThreat } from '../enemy-reach/enemy-reach.type';

const CHEST_OPEN_ROW_OFFSET = 2;

const FLOOD_GRID_SIZE = 64;

const FOLLOWER_SPRITE = 0x76;

const FOLLOWER_STEPS = [
  { room: 0x80, step: 'follower-join', verb: 'Rescuing', noun: 'the princess', following: false },
  { room: 0x12, step: 'follower-deliver', verb: 'Bringing', noun: 'the princess to the priest', following: true },
] as const;

const EVENT_STEPS = [
  { sprite: 0xee, room: 0x51, step: 'shelf-push', verb: 'Pushing', noun: 'the throne room shelf', needsFollower: true },
  { sprite: 0x16, room: 0x105, step: 'sage-quest', verb: 'Talking to', noun: 'the first sage', needsFollower: false },
] as const;

const EMPTY_THREAT: RoomThreat = { gating: [], clearable: true };

const DOOR_NOUN = { 'small-key': 'key door', 'big-key': 'big key door', bombable: 'bombable wall' } as const;

const DOOR_VERB = { 'small-key': 'Unlocking', 'big-key': 'Unlocking', bombable: 'Bombing' } as const;

const FOLLOWER_IN_TOW = 1;

export {
  CHEST_OPEN_ROW_OFFSET,
  FLOOD_GRID_SIZE,
  FOLLOWER_SPRITE,
  FOLLOWER_STEPS,
  EVENT_STEPS,
  EMPTY_THREAT,
  DOOR_NOUN,
  DOOR_VERB,
  FOLLOWER_IN_TOW,
};
