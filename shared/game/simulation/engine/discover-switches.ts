/* @layer shared-game @kind logic */
/**
 * Pull switches (Sprite_PullSwitch_bounce, sprite types 0x04-0x07) and the one
 * kind of remote effect one can have: draining a lake on an overworld screen
 * instead of raising a local shutter.
 */
import type { SimSprite } from '../types';
import type { PresenceGameState } from '../presence/state';

/**
 * Pulling a switch sets dung_flag_statechange_waterpuzzle, which the room's tag
 * routine reads to raise its trapdoors. That is what opens the Behind-Sanctuary
 * shutter onto the Sanctuary. Only meaningful in a room that still has a shutter shut.
 */
const isPullSwitch = (spriteType: number): boolean => spriteType >= 0x04 && spriteType <= 0x07;

/**
 * A pull switch whose effect reaches past its own room: the room's tag routine
 * writes an overworld event bit on a REMOTE screen (`save_ow_event_info[screen]
 * |= mask`), lowering water there instead of raising a local shutter. The same
 * bit also gates the one standing item whose own spawn code stays inactive
 * until it is set (see `standingItemPresent`). Both read this one table so
 * the switch offer and the item's presence can never drift apart.
 */
const DRAIN_SWITCHES: ReadonlyArray<{ switchRoom: number; screen: number; mask: number }> = [
  { switchRoom: 0x10b, screen: 0x3b, mask: 0x20 },
];

const drainEffectForSwitchRoom = (roomId: number) => DRAIN_SWITCHES.find((d) => d.switchRoom === roomId);
const drainEffectForScreen = (screenId: number) => DRAIN_SWITCHES.find((d) => d.screen === screenId);

/** Whether `mask` is already set on `screen` in the live overworld event bytes. */
const owEventSet = (presenceState: PresenceGameState | undefined, screen: number, mask: number): boolean =>
  ((presenceState?.owEventInfo[screen] ?? 0) & mask) !== 0;

/**
 * A standing/overworld item can additionally be held inactive by its OWN spawn
 * code until a remote drain runs. The one instance the game does this is a
 * heart-piece-type sprite on the drain-gated screen, which checks
 * `save_ow_event_info[screen] & mask` and stays dormant otherwise (same class
 * of hardcoded-C gate as the NPC presence conditions, transcribed the same
 * way). Every other standing item has no such gate: it fails open.
 */
const standingItemPresent = (sprite: SimSprite, presenceState: PresenceGameState | undefined): boolean => {
  if (!sprite.outdoor || (sprite.kind !== 'standing' && sprite.kind !== 'overworld')) return true;
  const gate = drainEffectForScreen(sprite.roomId);
  return !gate || owEventSet(presenceState, gate.screen, gate.mask);
};

export { isPullSwitch, drainEffectForSwitchRoom, drainEffectForScreen, owEventSet, standingItemPresent };
