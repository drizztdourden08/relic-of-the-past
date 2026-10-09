/* @layer renderer-components @kind constants */
import type { ScreenAnnotation } from '@rotp/navigation';

const TILE_PX = 8;
const MIN_DOT_RADIUS = 2.5;

const DOT_COLOR_REACHABLE = 'rgba(80, 200, 255, 0.6)';
const DOT_COLOR_REQ = 'rgba(255, 100, 180, 0.35)';
const RING_COLOR_GROUND = '#5b9bd5';
const RING_COLOR_ABOVE = '#c8a84e';
const RING_COLOR_BOTH = '#000';

const PATH_COLOR_REQ = 'rgba(255, 100, 180, 0.95)';
const PATH_COLOR_OPEN = 'rgba(80, 200, 255, 0.95)';
const CLIFF_ARROW_COLOR = '#cc5555';
const STAIR_ARROW_COLOR = '#ffffff';
const FALL_ZONE_COLOR = '#ffcc44';
const PIT_STRIPE_COLOR = '#ffcc00';
const BLOCKED_STRIKE_COLOR = '#d2534f';

const ARROW_HEAD_SPREAD = 0.5;
const PIT_ATTR = 0x20;
const PLAYER_FOOT_OFFSET = 8;
const PLAYER_BOX_PX = 16;
const BLOCKER_BOX_PX = 32;
const TUTORIAL_GUARD_SPRITE = 0x3f;
const BARRIER_SPRITE = 0x40;
const UNCLE_SPRITE = 0x73;

const DOOR_KINDS: ReadonlySet<ScreenAnnotation['kind']> = new Set([
  'key-door', 'big-key-door', 'shutter', 'bombable', 'follower-gate',
]);
const ANCHOR_NUDGE_TILES = 1;

export {
  TILE_PX, MIN_DOT_RADIUS, DOT_COLOR_REACHABLE, DOT_COLOR_REQ, RING_COLOR_GROUND, RING_COLOR_ABOVE, RING_COLOR_BOTH,
  PATH_COLOR_REQ, PATH_COLOR_OPEN, CLIFF_ARROW_COLOR, STAIR_ARROW_COLOR, FALL_ZONE_COLOR, PIT_STRIPE_COLOR,
  BLOCKED_STRIKE_COLOR, ARROW_HEAD_SPREAD, PIT_ATTR, PLAYER_FOOT_OFFSET, PLAYER_BOX_PX, BLOCKER_BOX_PX,
  TUTORIAL_GUARD_SPRITE, BARRIER_SPRITE, UNCLE_SPRITE, DOOR_KINDS, ANCHOR_NUDGE_TILES,
};
