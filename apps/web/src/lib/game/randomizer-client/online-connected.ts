/* @layer bridge-wasm @kind logic */
/**
 * Connected: store the slot's side of the room, resend what the server missed, scout once,
 * then poll. A reconnect finds the scout already answered and the overrides still armed, so
 * it only resumes polling. The poller's first tick reports every locally complete check the
 * server does not hold (poll-rebaseline.ts), which is how a check made offline reaches it.
 * Every location the room already holds as checked shows done in the tracker and is never
 * reported again (markRoomChecked). Before any of it, the save in play is bound to the room, or
 * the session ends when it belongs to another (online-room-identity.ts), so nothing of another
 * room's save reaches this one. A slot from another world package version is refused, and
 * the slot data's DeathLink decides over the profile's (slot-death-link.ts).
 */
import { log } from '../../log-bus';
import { parseSlotData } from '@shared/randomizer/archipelago/parse-slot-data';
import { GOAL_CHECK } from './online-goal';
import { applySlotDeathLink } from './slot-death-link';
import { bindSaveToRoom } from './online-room-identity';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { ApConnectedPacket } from './ap-protocol.type';
import type { PollEntry } from './location-poller';
import type { OnlineContext } from './online-context.type';

/** Stores the slot; the version refusal's message when the slot data is another package's. */
const storeSlot = (ctx: OnlineContext, packet: ApConnectedPacket): string | null => {
  const { room, names } = ctx;
  room.connected = true;
  room.team = packet.team;
  room.slot = packet.slot;
  room.players = Array.isArray(packet.players) ? packet.players : [];
  room.checked = new Set(packet.checked_locations ?? []);
  room.missing = new Set(packet.missing_locations ?? []);
  const parsed = parseSlotData(packet.slot_data);
  room.slotData = parsed.kind === 'ok' ? parsed.slotData : null;
  if (parsed.kind === 'malformed') log.randomizer('[Online] Slot data missing or not this world\'s shape', 'warn');
  names.setPlayers(room.players, packet.team);
  if (packet.slot_info) names.setSlotInfo(packet.slot_info);
  return parsed.kind === 'version' ? parsed.message : null;
};

/** The room holds these of the slot's locations as checked: the ones this game knows are marked. */
const markRoomChecked = (ctx: OnlineContext, locationIds: Iterable<number>): void => {
  const keys: LocationKey[] = [];
  for (const id of locationIds) {
    const key = ctx.maps.keyByLocationId.get(id);
    if (key !== undefined) keys.push(key);
  }
  if (keys.length > 0) ctx.core.markCollected(keys);
};

/** Whether the server already holds this key's check (a key it has no id for never reports). */
const isKnownReported = (ctx: OnlineContext, key: LocationKey): boolean => {
  if (key === GOAL_CHECK && ctx.goal.reached) return true;
  const id = ctx.maps.locationIdByKey.get(key);
  if (id === undefined) return key !== GOAL_CHECK;
  return ctx.room.checked.has(id);
};

const withGoal = (entries: readonly PollEntry[], goal: PollEntry | null): readonly PollEntry[] =>
  goal === null || entries.some((entry) => entry.key === goal.key) ? entries : [...entries, goal];

const sendScout = (ctx: OnlineContext): void => {
  ctx.send({ cmd: 'LocationScouts', locations: ctx.room.scoutIds, create_as_hint: 0 });
};

/**
 * First connect: the scout plan, trimmed to locations the slot really has. A reconnect whose
 * earlier connection dropped before the answer came asks again, or nothing would ever arm.
 */
const scoutOnce = (ctx: OnlineContext): void => {
  const { core, maps, room } = ctx;
  if (room.gameData === null || room.scouted) return;
  if (maps.keyByLocationId.size > 0) {
    if (!room.scoutArming) sendScout(ctx);
    return;
  }
  const plan = core.buildScoutPlan(room.gameData, maps);
  const slotLocations = new Set([...room.checked, ...room.missing]);
  const locationIds = plan.locationIds.filter((id) => slotLocations.size === 0 || slotLocations.has(id));
  for (const id of plan.locationIds) {
    if (!locationIds.includes(id)) maps.overriddenLocationIds.delete(id);
  }
  room.pollEntries = withGoal(plan.pollEntries, core.goalEntry());
  room.scoutIds = locationIds;
  room.scouted = locationIds.length === 0;
  if (!room.scouted) sendScout(ctx);
  log.randomizer(`[Online] Scouting ${locationIds.length} locations`);
};

const handleConnected = (ctx: OnlineContext, packet: ApConnectedPacket): void => {
  const { room, core } = ctx;
  if (room.gameData === null) {
    ctx.fail('[Online] Connected before the data package arrived');
    return;
  }
  const versionRefusal = storeSlot(ctx, packet);
  if (versionRefusal !== null) {
    ctx.fail(`[Online] ${versionRefusal}`);
    return;
  }
  if (!bindSaveToRoom(ctx)) return;
  ctx.markConnected();
  applySlotDeathLink(ctx);
  ctx.goal.onConnected();
  const unsent = [...room.reportedLocal].filter((id) => !room.checked.has(id));
  if (unsent.length > 0) ctx.send({ cmd: 'LocationChecks', locations: unsent });
  scoutOnce(ctx);
  markRoomChecked(ctx, room.checked);
  core.startPolling(ctx.reporter, room.pollEntries, (key) => isKnownReported(ctx, key));
  log.randomizer(`[Online] Connected as ${ctx.config.slotName} (slot ${packet.slot}, team ${packet.team})`);
};

export { handleConnected, isKnownReported, markRoomChecked, withGoal };
