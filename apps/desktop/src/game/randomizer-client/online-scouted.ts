/* @layer bridge-wasm @kind logic */
import { applyScoutOutcome } from './apply-scout-outcome';
import { wireList } from './wire-list';
import type { ApLocationInfoPacket, OnlineContext } from '@rotp/randomizer';

const handleLocationInfo = async (ctx: OnlineContext, packet: ApLocationInfoPacket): Promise<void> => {
  const { room, core, maps, names, reporter } = ctx;
  if (room.scouted || room.scoutArming) return;
  room.scoutArming = true;
  const outcome = await core.armScouted({
    scouts: wireList(packet.locations),
    maps,
    slot: room.slot ?? 0,
    slotData: room.slotData,
    seedName: room.roomInfo?.seed_name,
    playerName: (slot) => names.playerName(slot),
    itemName: (itemId, ownerSlot) => names.itemName(itemId, ownerSlot),
    gameOf: (slot) => names.gameOf(slot),
    reporter,
  }).finally(() => { room.scoutArming = false; });
  applyScoutOutcome(ctx, outcome);
};

export { handleLocationInfo };
