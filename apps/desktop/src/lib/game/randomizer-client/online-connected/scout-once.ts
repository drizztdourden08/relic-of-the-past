/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import type { OnlineContext } from '../online-context.type';
import { withGoal } from './with-goal';

const sendScout = (ctx: OnlineContext): void => {
  ctx.send({ cmd: 'LocationScouts', locations: ctx.room.scoutIds, create_as_hint: 0 });
};

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

export { scoutOnce };
