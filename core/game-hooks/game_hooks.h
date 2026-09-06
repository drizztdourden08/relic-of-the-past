/* @layer core-game-hooks @kind native */
#ifndef GAME_HOOKS_H
#define GAME_HOOKS_H

#include "src/types.h"

// ─── Item Overrides (item_overrides.c) ───

// Returns the replacement item for the chest at |slot| (the chest's ordinal within its
// room, tile - 0x58), or |original_item| if no override is set for that slot.
uint8 GameHook_OverrideChestItem(uint16 room_id, int slot, uint8 original_item);

// The escape-passage shelf's light-source ownership requirement: true when the vanilla
// condition holds, or when chest overrides are armed (a shuffled starting chest cannot
// guarantee the item, so the requirement is waived, mirroring the reference
// randomizer's patched game). Called from the one vendored seam in sprite_main.c.
bool GameHook_MantleRequirementSatisfied(void);

// ─── Npc Grant Overrides (npc_overrides.c) ───

// Returns the replacement item for a scripted (non-chest) grant of |item|, or |item|
// unchanged. Called from the one vendored seam at the Link_ReceiveItem entry (player.c);
// keyed by (room, vanilla item), excluded for chest receipts (item_receipt_method 1).
uint8 GameHook_OverrideNpcGrantItem(uint8 item);

// One-shot: the NEXT receipt carries an already-assigned item (delivery/cheat grant) and
// must pass the npc table unsubstituted. Armed in the same call that grants.
void GameHook_NpcOverrideBypassOnce(void);

// One-shot: the NEXT receipt replays an identified giver's grant remotely, so the npc
// table matches by vanilla item alone instead of the giver's room.
void GameHook_NpcOverrideMatchAnywhereOnce(void);

// True once the giver whose script grants |vanilla_item| had that grant substituted
// (the persistent completion bit, see the allocation block in npc_overrides.c).
// Called from the vendored re-offer gates of the possession-gated givers; false for
// any item without an allocated bit and always false on a vanilla profile (only a
// gated substitution ever writes a bit).
bool GameHook_SubstitutedGiftTaken(uint8 vanilla_item);

// Re-offer gate for a possession-gated giver, called with the script's original
// possession test as |vanilla_closed|. While an entry for |vanilla_item| is armed,
// possession is ignored entirely and the gate reads ONLY the substitution-completion
// bit (an early-arriving vanilla item from another check must not close a check never
// taken); with no armed entry or the gate word down, returns |vanilla_closed|, the
// vanilla expression, verbatim. Called from the vendored gates in sprite_main.c.
bool GameHook_GiftGateClosed(uint8 vanilla_item, bool vanilla_closed);

// Whether the continue/death menu offers the third (mountain) spawn: the real
// completion bit while the elder's grant is overridden this session, the vanilla
// possession test otherwise. Called from the one vendored seam in misc.c.
bool GameHook_MountainSpawnUnlocked(void);

// Raw byte view of the substitution-completion bits (byte_index 0 or 1), for the
// host-facing progress buffer.
uint8 GameHook_SubstitutionTakenByte(int byte_index);

// ─── Item power (item_power.c) ───
//
// The seven switches the reference randomizer bundles into one "item functionality" choice,
// gated on kRam_Features4. Every one of these returns the exact expression the vendored call
// site used to compute inline while its bit is clear, so a zero gate word is the unmodified
// game byte for byte.

// May a net swing at a fairy bottle it?
bool GameHook_NetCatchesFairies(void);

// What the blue barrier writes to link_disable_sprite_damage while it is up (vanilla: 1).
uint8 GameHook_ByrnaBarrierGuard(void);

// Frames between two meter units while the cape is worn (vanilla: the table entry itself).
uint8 GameHook_CapeDrainRate(uint8 frames);

// May an arrow be promoted to the silver damage class against sprite |k|?
bool GameHook_SilverArrowsBite(int k);

// What the magic powder turns an enemy into (vanilla: the fairy it was given).
uint8 GameHook_PowderTransmuteType(uint8 type);

// May a tablet be woken right now (vanilla: only by a beam blade)?
bool GameHook_TabletActivator(void);

// The "no blade in hand" half of the medallion refusal (vanilla: the sword-type test).
bool GameHook_MedallionBlockedBySword(void);

// ─── Dark-room lights (dark_room_lights.c) ───

// The "a light is carried" half of Hud_RestoreTorchBackground's refusal (vanilla: the lamp byte
// alone). Gated on kRam_Features4 beside the item-power switches, and phrased the same way: with
// the word clear this returns exactly the vendored expression, so the lamp stays the only light.
// Carrying a ticked item is the whole test, so a light costs no meter and needs no activation.
bool GameHook_CarriesDarkRoomLight(void);

// ─── Swordless paths (swordless_paths.c) ───
//
// What stands in for a blade when a seed can never hand one over, gated on kRam_Features4
// beside the item-power switches. Same contract: every one of these returns the exact
// expression the vendored call site used to compute inline while its bit is clear.

// Does the cut-open-door sequence run this frame (vanilla: the fourth frame of a swing)?
bool GameHook_CurtainSequenceRuns(void);

// The tile that sequence samples (vanilla: the swing's own reach from the player's OAM offset).
int GameHook_CurtainSequenceAnchor(void);

// May a hammer blow reach the last fight's two sprite types (vanilla: no)?
bool GameHook_HammerReachesLastFight(void);

// Does the tower's seal throw a blow back instead of taking it (vanilla: the beam-blade test)?
bool GameHook_TowerSealRepels(void);

// ─── Retro bow (retro_bow.c) ───

// May the arrow the bow just spawned stay? |vendored_ok| is the expression the bow
// handler always tested (an archery game that has not run dry, and an arrow left to
// spend). With the retro gate clear this IS that branch: the counter is decremented and
// the icon refreshed exactly as the vendored code did. With it set the counter is not
// consulted at all: the shot is paid for out of the wallet, or refused with nothing
// spent so the caller cancels the arrow. Called from the one vendored seam in player.c.
bool GameHook_BowShotSpend(bool vendored_ok);

// The archery game's own top-up, run by the bow handler right before each of its shots
// is spent. Gate clear: the vendored write (two arrows into the counter). Gate set: the
// counter is the quiver and stays put; the shot is marked as the game's own instead, so
// the spend lets it through unpaid. Called from the one vendored seam in player.c.
void GameHook_ArcheryShotAmmo(void);

// True while the retro gate is set AND the host has armed the costs: the one condition
// every retro seam answers to (retro_drops.c, retro_shelf.c).
bool GameHook_RetroBowActive(void);

// ─── The archery host's refusal (archery_host.c) ───

// The host's accept branch. |vendored_ok| is the expression he always tested: the offer taken and a
// wallet that covers the fee. With both gates clear it is handed straight back, so the branch is the
// vendored one. With either set, an accepted offer is still refused when the five shots the fee buys
// could not be fired at all, and the refusal is remembered for the message call below.
// Called from the one vendored seam in sprite_main.c.
bool GameHook_ArcheryHostAccepts(bool vendored_ok);

// The line the host's refuse branch shows. |vendored_msg| is the one it always showed, and stands for
// an offer turned down or a wallet that falls short; a refusal that came from the guard above swaps in
// the line that says why instead. Consumes the guard's latch, so a later plain refusal is never
// mistaken for ours. Called from the one vendored seam in sprite_main.c.
int GameHook_ArcheryRefusalMessage(int vendored_msg);

// ─── Retro drops (retro_drops.c) ───

// The sprite type a ground prize is given. |type| is what the vendored spawn was about
// to write (Sprite_SpawnDynamicallyEx, PrepareEnemyDrop); with retro active the two
// arrow prizes become the blue and the red rupee, otherwise it is returned unchanged.
uint8 GameHook_RetroPrizeType(uint8 type);

// The arrow counter as the thief and the pikit read it when they roll for arrows:
// the counter itself, or an empty one with retro active so nothing is stolen.
uint8 GameHook_StealableArrows(void);

// The chest game's rolled reward: the two arrow rewards become rupees with retro
// active, otherwise |item| unchanged. Called from the one vendored seam in dungeon.c.
uint8 GameHook_RetroMinigamePrize(uint8 item);

// ─── Retro shelf (retro_shelf.c) ───

// Shelf seam, called in the shopkeeper dispatch right after GameHook_OverrideShopItem.
// True: this shelf is retro-stocked (the quiver, then a refill) and fully handled, so
// the vendored dispatch is skipped. False for every other sprite, and always false with
// the gate clear or nothing armed.
bool GameHook_RetroShopItem(int k);

// ─── Drop Overrides (drop_overrides.c) ───

// Grant seam for the free-standing key drops. True when the absorption of sprite |k|
// was intercepted (the assigned item was granted through the native receive path and
// the vanilla pickup bits written). The caller must skip the vanilla grant entirely.
bool GameHook_OverrideDropAbsorption(int k);

// Draw seam for the same drops. True when sprite |k| was drawn as its assigned item
// (receipt art via the shared animated-tile decode slot). The caller must skip its
// own drawing but still run the sprite's logic.
bool GameHook_DrawDropOverride(int k);

// ─── Standing Overrides (standing_overrides.c) ───

// Grant seam for the standing in-world prizes (the touch pickup in the prize sprite's
// handler). True when the pickup of sprite |k| was intercepted: the assigned item was
// granted natively and the vanilla obtained-flag written. The caller must skip the
// vanilla grant entirely.
bool GameHook_OverrideStandingAbsorption(int k);

// Grant seam for the dash-item standing dungeon key, whose vanilla pickup is a silent
// key-counter bump crossing no receive seam. Same contract as the absorption hook.
bool GameHook_OverrideBonkKeyGrant(int k);

// Draw seam for the same prizes. True when sprite |k| was drawn as its assigned item,
// the caller must skip its own drawing but still run the sprite's logic.
bool GameHook_DrawStandingOverride(int k);

// ─── Upgrade virtual receive ids (upgrade_grants.c) ───

// True for a reserved upgrade id (0x50-0x61), a counter upgrade riding the override
// tables above the native receive-id space. Such an id never reaches vendored code.
bool GameHook_IsUpgradeVirtualId(uint8 item);

// Pure presentation lookup for the draw seams: the native refill item a virtual
// upgrade id renders as; any other id passes through unchanged.
uint8 GameHook_UpgradePresentationOf(uint8 item);

// Any virtual family (upgrade 0x50-0x61, progressive 0x62-0x66, wallet 0x67-0x76,
// progressive capacity 0x77-0x7A): the one sanctioned exception to the 76-entry native
// bound every override table and the receipt export enforce.
bool GameHook_IsVirtualGrantId(uint8 item);

// The native item any grant id draws as: a virtual upgrade as its refill item, a
// progressive id as the next tier from live inventory, a wallet slot as its rupee
// receipt, a native id as itself. Pure.
uint8 GameHook_GrantPresentationOf(uint8 item);

// Resolve a grant id at the last moment before the native receive flow: a virtual
// upgrade id applies its arithmetic, arms the upgrade message (if-clear), and yields its
// presentation item; a progressive id yields the next tier's native id; a wallet slot
// climbs the ladder and yields its rupee receipt; any other id passes through unchanged.
uint8 GameHook_ResolveGrantItem(uint8 item);

// ─── Dungeon prize shuffle (prize_grants.c) ───

// The seven prize crystals' virtual receive ids (0x7B-0x81), the second sanctioned
// exception to the 76-entry native bound, alongside GameHook_IsVirtualGrantId. The three
// pendants need no id of their own: their native ones already bank a fixed bit.
bool GameHook_IsPrizeGrantId(uint8 item);

// Pure presentation lookup for the draw seams: a crystal id draws as the native crystal
// receipt; any other id passes through unchanged.
uint8 GameHook_PrizePresentationOf(uint8 item);

// Resolve a crystal id at the last moment before the native receive flow: the bit is
// banked and the native crystal receipt id is returned. Composes after
// GameHook_ResolveGrantItem; any other id passes through unchanged.
uint8 GameHook_ResolvePrizeItem(uint8 item);

// The rising crystal's bit (ancilla.c). |vanilla_bit| is the room's own crystal, returned
// verbatim with the gate down or with no assigned crystal in flight.
uint8 GameHook_CrystalPrizeBit(uint8 vanilla_bit);

// The boss room tags' "this dungeon's reward is already claimed" test.
// |vanilla_flagged| is the caller's own bit test, so the gate-down answer is that
// expression verbatim.
bool GameHook_DungeonPrizeTaken(int vanilla_flagged);

// Record that the current dungeon's falling reward was handed over. Called from the
// substitution seam for every grant it applies; only a boss reward qualifies.
void GameHook_NoteDungeonPrizeGrant(uint8 vanilla_item);

// The delivery path: bank a crystal id's bit without a receipt. True when |item| was a
// crystal id and was handled.
bool GameHook_DeliverPrizeItem(uint8 item);

// Read side (host + probes): the claimed mask, palaces 0-7 in the low byte and 8-15 in the
// high one, and the crystal a receipt in flight will bank (0 for none). Ungated: these
// bytes are only ever WRITTEN under the gate.
int GameHook_PrizeTakenMask(void);
uint8 GameHook_PendingPrizeCrystal(void);

// ─── Dungeon-item shuffle (dungeon_item_grants.c) ───

// The targeted dungeon-item ids (0xC0-0xFD, one per kind and palace index, see
// dungeon_item_ids.h). Folded into GameHook_IsVirtualGrantId, so every bound check and
// every resolver already accepts them.
bool GameHook_IsDungeonItemGrantId(uint8 item);

// Pure presentation lookup for the draw seams: a targeted id draws as its family's own
// native item; any other id passes through unchanged.
uint8 GameHook_DungeonItemPresentationOf(uint8 item);

// Resolve a targeted id at the last moment before the native receive flow: the dungeon is
// banked as the pending target and the family's native id is returned. Composes into
// GameHook_ResolveGrantItem; any other id passes through unchanged.
uint8 GameHook_ResolveDungeonItemGrant(uint8 item);

// The byte the receipt applies |item| to (misc.c). |vanilla| is the caller's own
// &g_ram[kMemoryLocationToGiveItemTo[item]], returned verbatim with the gate down; a small
// key banked for a dungeon other than the loaded one is written to that dungeon's own
// earned-count byte instead.
uint8 *GameHook_ReceiptTargetByte(int item, uint8 *vanilla);

// The bit the receipt sets for a compass, a big key or a map (misc.c). |vanilla_bit| is
// the caller's own current-dungeon bit, returned verbatim with the gate down or with no
// target in flight.
int GameHook_DungeonItemBit(int vanilla_bit);

// Read side (probes): the palace a receipt in flight will credit, -1 for none. Ungated:
// the target is only ever ARMED under the gate.
int GameHook_PendingDungeonItemPalace(void);

// One capacity step for |kind| (0 explosives / 1 projectiles), the pond handler's own
// per-visit arithmetic; true when the step was past the reachable bound and paid the
// pond's consolation instead. Side effects: callers hold an open grant seam.
bool GameHook_CapacityStep(int kind);

// ─── Capacity profile (capacity_profile.c) ───

// New-file seam (select_file.c, right after the kSramInit_Normal memcpy): seed |block|
// (the fresh file's init block, sram + 0x340) with the Custom families' starting tiers.
// Returns without touching the block unless kFeatures3_CapacityProfile is set and a
// profile is armed.
void GameHook_InitNewFileCounters(uint8 *block);

// True when |kind| (0 explosives / 1 projectiles / 2 meter) is Custom under the gate: the
// profile owns its ladder, the empty rung included.
bool GameHook_CapacityFamilyCustom(int kind);

// Cap-table seam (hud.c refill drain and digit color, the shop refusals): the native table
// entry for |level| (kMaxBombsForLevel / kMaxArrowsForLevel) unless a Custom |kind| under
// the gate stands on the empty rung, where the capacity is 0.
int GameHook_CapacityMax(int kind, int level);

// Meter cost seam (player.c LinkCheckMagicCost): |cost| back untouched unless a Custom meter
// under the gate stands on the empty rung, where the cost exceeds any meter.
uint8 GameHook_MagicCost(uint8 cost);

// Meter capacity seam (hud.c refill drain and Hud_RefillMagicPower, the cheat clamp): the
// full meter, 0x80, unless a Custom meter under the gate stands on the empty rung, where it is 0.
uint8 GameHook_MagicCapacity(void);

// One rung up for a stepped |kind|: the profile ladder up to its final rung under a Custom
// setting, the native level arithmetic up to the grid's last level otherwise. False when
// nothing is left to climb. Side effects: callers hold an open grant seam.
bool GameHook_CapacityClimb(int kind);

// A direct level write (the cheats) leaves the empty rung.
void GameHook_CapacityLeaveEmptyRung(int kind);

// The persisted empty-rung flag of |kind| (SRM_EMPTY_RUNG, save_bytes.h); 0 on a vanilla file.
uint8 GameHook_CapacityEmptyRungFlag(int kind);

// The rung |family| (0-3) stands on right now, off the save bytes; the wallet's is its index.
int GameHook_CapacityRungOf(int family);

// The starting rung the profile armed for |family|; -1 unless Custom under the gate.
int GameHook_CapacityStartRung(int family);

// hud.c MaxRupees seam: |vanilla| back untouched unless a Custom wallet is armed under the
// gate, in which case the ladder's cap (0, then 100 * index - 1) when that is lower. Never raises.
int GameHook_WalletMax(int vanilla);

// The persisted wallet ladder index (SRM_WALLET_LADDER_INDEX, save_bytes.h); 0 on a vanilla file.
uint8 GameHook_WalletLadderIndex(void);

// True when a wallet step has nothing left to climb (cap reached, or no Custom wallet).
bool GameHook_WalletLadderAtCap(void);

// Climb |steps| rungs up to the profile's final index; true when any step was surplus.
// Writes nothing without a Custom wallet under the gate.
bool GameHook_WalletLadderClimb(int steps);

// ─── Wallet virtual receive ids (wallet_grants.c) ───

// True for a wallet slot id (0x67-0x76), a slot into the session's jump table.
bool GameHook_IsWalletVirtualId(uint8 item);

// Pure lookup: the fifty-rupee receipt while the slot can still climb, the twenty-rupee
// replacement once it cannot; any other id passes through unchanged.
uint8 GameHook_WalletPresentationOf(uint8 item);

// The resolver behind GameHook_ResolveGrantItem for a wallet slot: climbs the ladder by
// the slot's rungs, arms the generic class message, yields the presentation item.
uint8 GameHook_ResolveWalletItem(uint8 item);

// The capacity family of a grant id (0 explosives, 1 projectiles, 2 meter, 3 wallet),
// -1 for any other id. Pure. (upgrade_grants.c)
int GameHook_UpgradeFamilyOf(uint8 item);

// ─── Progressive capacity ids (capacity_progressive.c) ───

// True for a progressive capacity id (0x77-0x7A), one per family; every pickup climbs to
// the next rung of the plan the host armed (WasmSetCapacityPlanJump).
bool GameHook_IsProgressiveCapacityId(uint8 item);

// The family (0-3) of a progressive capacity id, -1 for any other id. Pure.
int GameHook_ProgressiveCapacityFamilyOf(uint8 item);

// Pure lookup: the family's receipt item, or the wallet's replacement once its plan is done.
uint8 GameHook_ProgressiveCapacityPresentationOf(uint8 item);

// The resolver behind GameHook_ResolveGrantItem for a progressive capacity id: climbs to
// the next planned rung, arms that rung's pre-rendered line (replacing the location's),
// yields the presentation item. Degrades to the family's one-rung fixed id without a plan.
uint8 GameHook_ResolveProgressiveCapacityItem(uint8 item);

// ─── Capacity fixed lines (capacity_fixed_lines.c) ───
// The pre-rendered receipt line for a fixed-jump climb of |jump| rungs from |from_rung| in
// |family| (0-3), -1 when the host armed none. Pure read of a record-only table.
int GameHook_CapacityFixedLine(int family, int from_rung, int jump);

// The icon overlays (upgrade_icon.c, gear_icon.c, retro_quiver_icon.c): icon_overlays.h.
#include "icon_overlays.h"
// The capacity pickup bonus (upgrade_bonus.c): upgrade_bonus.h.
#include "upgrade_bonus.h"

// ─── Progressive virtual receive ids (progressive_grants.c) ───

// True for a reserved progressive id (0x62-0x66), one copy of a multi-tier equipment
// family, resolved to the next tier from live inventory. Never reaches vendored code.
bool GameHook_IsProgressiveVirtualId(uint8 item);

// Pure lookup: the native id the next tier of |item|'s family grants right now, the
// twenty-rupee replacement past the top tier; any other id passes through unchanged.
uint8 GameHook_ProgressivePresentationOf(uint8 item);

// The resolver behind GameHook_ResolveGrantItem for a progressive id: the next tier's
// native id, with the pedestal-ceremony guard armed when that id is the second blade.
uint8 GameHook_ResolveProgressiveItem(uint8 item);

// The id a CONCRETE tier pickup hands over, for a family whose rungs arrive as themselves
// instead of as nameless copies (the per-family order setting). Itself, unless the file
// already stands at or above the rung it names, since a receipt SETS a tier, so a lower rung
// arriving later would otherwise walk the family back down; that surplus pays the same
// twenty-rupee replacement a surplus progressive copy pays. Pure, and a no-op for every
// family no session armed.
uint8 GameHook_IndependentTierGrantOf(uint8 item);

// Receive-seam tail (called from GameHook_NotifyItemReceived, still inside
// Link_ReceiveItem): consumes the ceremony guard armed by the resolver above, putting
// the pedestal-ceremony state a second-blade receipt starts back to a plain hold-up.
// No-op unless armed.
void GameHook_ProgressiveAfterReceipt(uint8 item);

// ─── Scripted-grant substitution (scripted_grants.c) ───

// Record a substitution-completion bit by its allocation key (npc_overrides.c owns
// the table; synthetic keys 0xF0+ mark grants with no vanilla receive id).
void GameHook_MarkSubstitutionKey(uint8 key);

// Pond seam: true when the capacity purchase of |kind| (0 explosives / 1 projectiles)
// was substituted. The caller skips the vanilla counter bump and its message.
bool GameHook_OverrideCapacityGrant(int kind);

// The rupee pond's plan (pond_plan.c). Under a plan the pond sells a numbered sequence
// of throws instead of its native purchase loop: each hook below answers to
// kFeatures3_PondPlan and, with the gate down or nothing armed, hands back exactly the
// value the vendored expression already computed.
//
//   GameHook_PondPlanOpen        true while a plan owns the pond.
//   GameHook_PondThrowIndex      the throw about to be paid for, or -1.
//   GameHook_PondPromptOverride  cost-prompt seam: the plan announced its own price, so
//                                the vanilla two-choice line is skipped.
//   GameHook_PondThrowCost       affordability seam: what this throw costs (an exhausted
//                                pond names a price no wallet holds, closing it).
//   GameHook_PondLaterMessage    refusal seam: an exhausted pond's own closing line; a
//                                wallet too light for the price keeps the vanilla one.
//   GameHook_PondThrowAmount     payment seam: the rupees actually taken and shown.
//   GameHook_PondPoolAdd         what the throw puts in the pond's own bank.
//   GameHook_PondTakeThrow       resolve the paid throw and advance the counter.
//   GameHook_PondConsolationMessage  that throw's consolation line, without resolving it.
//   GameHook_PondPrizeSlot       the grant armed for one prize ordinal.
//   GameHook_PondThrowsTaken     the raw counter, for the progress buffer and the probes.
bool GameHook_PondPlanOpen(void);
int GameHook_PondThrowIndex(void);
bool GameHook_PondPromptOverride(void);
int GameHook_PondThrowCost(int vanilla);
int GameHook_PondLaterMessage(int vanilla);
int GameHook_PondThrowAmount(int stored);
int GameHook_PondPoolAdd(int amount);
bool GameHook_PondTakeThrow(int *prize, int *refund, int *msg);
int GameHook_PondConsolationMessage(void);
bool GameHook_PondPrizeSlot(int prize, int *new_item, int *msg, int *fire_id);
uint8 GameHook_PondThrowsTaken(void);

// The gems a plan throw sends into the pond (pond_toss_draw.c): the amount decomposed
// over the six denominations and spawned in volleys, one decoded sheet at a time.
// GameHook_PondTossRupees is false with no plan open, so the vendored five-rupee spawn
// runs instead; GameHook_PondTossNextVolley refills the pond's slots with the next
// volley when they are all spent, and GameHook_PondTossDelay stretches the purchase
// wait to cover them.
bool GameHook_PondTossRupees(int amount);
bool GameHook_PondTossNextVolley(void);
int GameHook_PondTossDelay(int vanilla);

// The receipt id of gem |index| of |amount|'s decomposition, largest first; -1 past the
// last gem. Pure. The probe harness pins the decomposition through it.
int GameHook_PondGemAt(int amount, int index);

// Whether the cave bat's grant was already substituted (ungated read of the
// completion bit: once the check's item went out, the bat stays closed).
bool GameHook_BatGrantTaken(void);

// Bat seam: true when the meter-upgrade moment of sprite |k|'s cutscene was
// substituted. The hook advances the cutscene state itself; the caller returns.
bool GameHook_OverrideBatGrant(int k);

// Minigame seam: the prize id the once-only top roll |t| should grant, the armed
// substitution for this room when one applies, |rv| unchanged otherwise.
uint8 GameHook_OverrideMinigamePrize(uint8 rv, int t);

// ─── World-item draw substitution (world_item_draws.c / receipt_ancilla_draws.c) ───

// Draw-only peek into the npc-override table (npc_overrides.c): the item the receive
// seam WOULD substitute for a grant of |vanilla_item| in the current context, or -1.
// Reads only, safe to call every drawn frame.
int GameHook_PeekNpcGrantItem(uint8 vanilla_item);

// Draw seam for a world item sprite whose grant substitutes at the receive seam under
// |vanilla_item| (the standing fungus 0x29, the shelved tome 0x1d, the thrown reward
// sprite's carried id). True when sprite |k| was drawn as its assigned item. The
// caller must skip its own drawing but still run the sprite's logic.
bool GameHook_DrawWorldItemOverride(int k, uint8 vanilla_item);

// Same seam for the pedestal blade sprite (vanilla grant id 1), with the receipt art
// centered on the blade's own two-column span.
bool GameHook_DrawPedestalItemOverride(int k);

// Draw seam for the falling milestone-prize ancilla. Returns the advanced OAM pointer
// when ancilla |k| was drawn as its assigned item, NULL when the caller must run its
// own vanilla draw (same position args as that draw).
OamEnt *GameHook_DrawFallingPrizeOverride(int k, int x, int y);

// Draw seam for the dug-up instrument ancilla (vanilla grant id 0x14). True when the
// assigned item was drawn. The caller skips its own OAM write but keeps its
// off-screen check.
bool GameHook_DrawDugUpItemOverride(int k, int x, int y);

// ─── Receipt grants + contextual receipt messages (receipt_grant.c / receipt_messages.c) ───

// Message ids of the randomizer template lines the language bake appends after the 397 canonical
// vanilla dialogue lines of every baked language. The order here MUST match the template list in
// shared/asset-extraction/text/data/randomizer-templates.ts (the TS side of the same contract), and
// a new line is only ever APPENDED, since every id already baked into a player's asset blob is fixed.
// The first five are the receipt classes; the rest belong to whichever seam names them.
enum {
  kReceiptMsgBase         = 397,
  kReceiptMsg_Generic     = kReceiptMsgBase + 0,
  kReceiptMsg_Progressive = kReceiptMsgBase + 1,
  kReceiptMsg_DungeonItem = kReceiptMsgBase + 2,
  kReceiptMsg_Delivered   = kReceiptMsgBase + 3,
  kReceiptMsg_Online      = kReceiptMsgBase + 4,
  // Position 5 is the archery host's refusal, named where it is shown (archery_host.c).
};

// Arm |msg| as the finishing receipt's message unless one is already armed. A one-shot the host
// set for this grant (richer context) always wins over a class default. Gated record: no-op while
// kFeatures3_ReceiptMessages is off, so a closed gate can never hold a stale arm.
void GameHook_ArmReceiptMessageIfClear(int msg);
// The progressive capacity resolver's arm: replaces the armed one-shot (receipt_messages.c).
void GameHook_ArmReceiptMessageReplace(int msg);
// Link_ReceiveItem ran: the new receipt claims the armed one-shot, and an arm a previous
// receipt claimed without consuming (a seam-skipping room, no free ancilla) is dropped.
void GameHook_ReceiptMessageClaim(void);
// The armed one-shot, unconsumed (the headless probes).
int GameHook_PeekReceiptMessage(void);

// Arm the class template for |item_id|: progressive / dungeon-item derived from the id alone,
// |fallback_msg| otherwise. Same if-clear and gate rules as above.
void GameHook_ArmReceiptClassMessage(uint8 item_id, int fallback_msg);

// The message id the finishing receipt should show: the armed one-shot when the gate is open and
// the loaded dialogue blob carries it, |vanilla_msg| otherwise. Consumes the one-shot either way.
// Called from the one vendored seam in ancilla.c where the receipt's message id is chosen.
int GameHook_ReceiptMessageOverride(uint8 item_id, int vanilla_msg);

// ─── Tracker Notifications (game_hooks.c) ───

// Called from Link_ReceiveItem() whenever the player receives an item.
void GameHook_NotifyItemReceived(uint8 item_id, uint8 method);

// A physical override entry (npc/drop/standing table) substituted its grant; reports
// the host-assigned completion id the arming call carried. -1 = no report.
void GameHook_NotifyOverrideFired(int fire_id);

// Shelf seam (core/game-hooks/shop_overrides.c), called at the top of the shopkeeper-family
// sprite dispatch. True: this sprite is a randomized shelf and the hook has fully handled it
// (drawn it as the assigned item, taken the payment, granted, or emptied a sold-out shelf),
// so the vendored dispatch is skipped. False for every clerk, minigame and unarmed shelf.
bool GameHook_OverrideShopItem(int k);

// Cauldron seam (core/game-hooks/shop_overrides.c), called at the top of the potion-shop
// sprite dispatch. Same contract as the shelf seam over the hut's three cauldrons; false
// for the assistant, the powder and any unarmed cauldron.
bool GameHook_OverrideShopCauldron(int k);

// Bomb-counter seam (core/game-hooks/shop_overrides.c), called at the top of the bomb-shop
// sprite dispatch. Same contract over the refill spot alone; false for the clerk, the huff
// and the story bomb, which are never armed.
bool GameHook_OverrideShopBombSlot(int k);

// ─── Check Triggers (check_triggers.c) ───

// Programmatically trigger a chest check: sets room flag, gives the item,
// plays the hold-up animation, and fires the JS notification.
void GameHook_TriggerCheck(uint16 room_id, uint8 chest_index, uint8 item_id);

// Programmatically trigger an NPC-type check (Uncle, the village elder, etc.)
void GameHook_TriggerNpcCheck(uint8 flag_type, uint8 flag_mask, uint8 item_id,
                              uint8 sprite_type_id, uint8 post_gfx);

// Programmatically trigger a standing-overworld-item check: sets the screen's
// event bit and grants the item.
void GameHook_TriggerOverworldCheck(uint8 screen, uint8 mask, uint8 item_id);

// ─── State Queries (state_queries.c) ───

// True while `effectiveModule` is MODULE_FALLING_ENTRANCE (11) via the vanilla overworld
// special-switch-area path (one of 3 locked-view locations reached by walking onto a
// switch tile) and not an actual dungeon pit-fall. Both reuse the same module;
// overworld_screen_index staying >= 128 is what's unique to the special-area flavor.
// Use this form once a menu-overlay remap has already been resolved (main_module_index
// == 14, the real module in saved_module_for_menu), because passing the raw main_module_index
// there would stop recognizing the special area the instant the pause menu opens over it.
bool GameHook_IsOverworldSpecialAreaFor(int effectiveModule);

// Raw-module form: true while main_module_index itself is the special-area flavor.
// Anything gating on "is this normal interactive gameplay right now" (accepting live
// input) should use this, because it excludes the paused/menu-overlay state, matching
// how a normal overworld location already behaves while paused.
bool GameHook_IsOverworldSpecialArea(void);

// ─── Cheats (cheats.c) ───

// Returns the current outgoing damage multiplier (1 = normal).
uint8 GameHook_GetDamageMultiplier(void);

// Returns extra armor reduction percentage (0-100). Stacks with armor.
uint8 GameHook_GetExtraArmorPct(void);

// Applies the extra-armor cheat to an incoming damage value (no-op at 0%).
uint8 GameHook_ApplyExtraArmor(uint8 dmg);

// Resolves the desired value (0 or 1) for the cheatWalkThroughWalls WRAM byte this frame, gate
// included. Called every frame by zelda_rtl.c's cheat-WRAM reconcile so a save-state restore (which
// overwrites that byte along with the rest of WRAM) never leaves a stale value behind.
uint8 GameHook_GetWantedIgnoreCollision(void);

// ─── View gates (view_gates.c) ───

// True while the lamp's light-cone mask is on the subscreen, so the extended view must collapse to
// the base frame: the mask only covers 256 pixels and its tilemap wraps, so any extra width samples
// a second, undarkened copy of the cone. Covers the room-transition frames where the game clears
// hdr_dungeon_dark_with_lantern while the mask is still being drawn. Wide view only.
bool GameHook_LightConeSuppressesExtraWidth(void);

// ─── Custom player sprite sheets (player_sprite.c) ───

// Overwrite the player gfx asset from a ZSPR sheet and take its palette into the PPU's private player
// bank. |push_live| lands the colors straight away, so pass false before the core is initialized.
// Returns false (assets untouched) if the sheet is malformed.
bool PlayerSprite_Apply(const uint8 *data, size_t len, bool push_live);

// Put the stock sheet back and return the player to the shared palette row. No-op when none is applied.
void PlayerSprite_Restore(bool push_live);

// True while a custom sheet is applied.
bool PlayerSprite_HasCustom(void);

// Reload gear palettes so the player's banked colors are rebuilt for the current armor and gloves.
void PlayerSprite_RefreshPalette(void);

// The game loaded a gear palette into the shared sprite row; |src| is the outfit it chose inside
// kPalette_ArmorAndGloves. Mirrors it into the player's private bank when a custom sheet is applied.
void GameHook_PlayerGearPaletteLoaded(const uint16 *src);

// The gloves color was refreshed on its own, without a full gear reload.
void GameHook_PlayerGlovesColorUpdated(void);

// ─── HUD/Pause Override (hud_override.c) ───

// True while kFeatures3_HudOverride permits hiding the native HUD/pause menu. WasmSetHudHidden and
// WasmSetPauseHidden (core/wasm-build/emscripten_api.c) test this before honoring a hide request.
bool HudOverride_Allowed(void);

// Force the native HUD and pause menu fully back on screen. Called the instant kFeatures3_HudOverride
// reads clear on gate word 3 (Vanilla Safe engaging, the enhanced-HUD setting turning off, or a future
// embedder), mirroring PlayerSprite_Restore undoing the sprite override on the same trigger. A safe
// no-op when neither is currently hidden.
// Record whether the host WANTS the native HUD / pause menu hidden. The gate is applied by
// HudOverride_Sync, not at this call, so a request made before the gate word reaches WRAM still takes
// effect once it does.
void HudOverride_SetWantedHudHidden(bool on);
void HudOverride_SetWantedPauseHidden(bool on);

// Reconcile both hide masks against the gate and the wanted values. Runs every frame after
// SyncGateWords/SyncCheatWram, and on any change to either input.
void HudOverride_Sync(void);

void HudOverride_Restore(void);

// ─── Dark-room lighting cheat (cheat_lighting.c) ───

// Re-assert (or take back down) the lamp cone in a dark room the player has no lamp for. Runs every
// frame after SyncGateWords/SyncCheatWram, and is a no-op unless the cheat is armed or a cone it
// raised is still standing.
void CheatLighting_Sync(void);

// ─── Receive counters (receive_counters.c) ───

// Tally an item grant against its call site, so a check granted twice is visible instead of inferred.
void SimCountReceive(uint8 site, uint8 item_id);

// ─── Gated empty region (gated_empty.c) ───

// The buffer a refused query returns when the real one is a live-WRAM alias that must not be blanked.
void *GatedEmpty(void);

// ─── Haptic Events (haptic_events.c) ───

// Called when the player starts a sword swing animation.
// swing_type: 0 = normal full swing, 1 = rapid re-swing (quick slash)
void GameHook_NotifySwordSwing(int swing_type);

// Called when the player's sword connects with an enemy sprite.
void GameHook_NotifySwordHitEnemy(uint8 damage_dealt);

// Called when the player's sword clinks against an invulnerable surface/enemy.
void GameHook_NotifySwordClink(void);

// Called when the player takes damage (damage_amount = hearts lost in 1/8ths).
void GameHook_NotifyDamageTaken(uint8 damage_amount);

// Called when the player uses a Y-button item.
void GameHook_NotifyItemUsed(uint8 item_id);

// Called for environmental haptic events (falling, landing, chest open, etc.)
// event_type: 0=fall_into_pit, 1=land_from_ledge, 2=chest_open, 3=bomb_explode,
//             4=enter_water, 5=mirror_warp, 6=quake, 7=boss_defeated
void GameHook_NotifyEnvironmentalEvent(uint8 event_type);

// Called when hookshot hits a wall and retracts.
void GameHook_NotifyHookshotWall(void);

// Called when boomerang returns to the player (catch).
void GameHook_NotifyBoomerangCatch(void);

// ─── Attr Grid State Snapshot (attr_grid_state.c) ───

// Save the WRAM scratch span WasmBuildOverworldAttrGrid's vendored decode step writes through,
// before running the decode.
void AttrGridState_Snapshot(void);

// Put that scratch span back exactly as it was. Called on every return path out of
// WasmBuildOverworldAttrGrid, including the gated-off one, so the decode is never observable
// from inside a live run.
void AttrGridState_Restore(void);

// ─── Transition Events (transition_events.c) ───

// Called once per game frame from Module_MainRouting, after the frame's module has run.
// Host-calls are gated on kFeatures0_DeveloperTools; it also drives the C-side receipt
// art guard below, which rides its own gate and makes no host-calls.
void GameHook_ModuleFrameEnd(void);

// While a message box overlaps a hold-up item receipt, re-decodes the held item's
// tiles each frame (the box's legacy story-sheet decompression clobbers the shared
// scratch the animated receipts re-expand from). Gated on kFeatures3_ReceiptMessages.
void GameHook_ReceiptPoseGfxGuard(void);

// Captures the completed OAM for one frame into a diagnostic ring; no-op without developer tools.
void GameHook_CaptureOamFrame(void);

// Captures the player's pose/DMA/handler state for one frame into the pose ring
// (state_queries_pose.c); no-op without developer tools.
void GameHook_CapturePoseFrame(void);

// ─── Running Man Widescreen Overrun (running_man.c) ───

// Called every frame right after RunningMan_Draw, before Sprite_ReturnIfInactive gates the rest of
// the function. No-op unless a wide/tall view is active and he's actively fleeing; otherwise clears
// the screen-relative active window's per-frame pause and immunizes him against its auto-kill, so a
// stationary player doesn't leave him frozen mid-view well short of the fence/forest.
void GameHook_RunningManStayActive(int k);

// Called at the point the scripted right-side leg sequence (right, down, right) would normally
// hand him back to idle. Vanilla's script is a fixed handful of frames tuned to end past a 256px
// screen, which falls well short of a wide view. Returns false (vanilla ends the flee, unchanged)
// unless a wide/tall view is active; when it returns true, the caller must skip that transition,
// because this call has already re-armed him to keep running the same direction.
bool GameHook_RunningManExtendRun(int k);

// Called each frame Sprite_RunningMan is in a run leg. No-op unless a wide/tall view is active
// (Wide_Active()); otherwise accelerates his fixed vanilla velocity over time and ends the flee
// (back to idle, in place) at a world-distance cap or the moment he collides with solid geometry,
// so a wide view never shows him stuck against the fence/forest bounding the Kakariko race track.
void GameHook_RunningManOverrun(int k, bool running);
// ─── Music (music_hooks.c) ───

// Called on every write the game makes to the SPC music-control port. Reports the raw control byte
// plus the location context a host player needs to resolve which music it actually means (the module,
// the entrance, and the overworld area). Gated on kHostGate_ExternalMusic: zero host-calls when off.
void GameHook_MusicCtrl(uint8 music_ctrl);

// True while the host owns music playback, so the core keeps its own music channel silent.
bool GameHook_MusicExternal(void);

// Re-announces the current track so the sound chip resumes its own music. Call BEFORE clearing
// the external-music gate: the control port is held paused while the host plays, and nothing
// else would write it again until the music happened to change.
void GameHook_MusicRestore(void);

// Re-reports the track and the ambient bed the game is currently playing, for a host that attached
// after they were selected. Silences the chip's own copies on the way. Gated the same as MusicCtrl.
void GameHook_MusicAnnounce(void);

// Which entrances an extended pack gives a track of their own, as 5 words of 32 bits (133 entrances).
void GameHook_SetDeluxeEntrances(int index, uint32 bits);

// Re-raises the ambient bed a restored snapshot was playing and, when the host claims it, silences
// the chip's own resumed copy, which would otherwise sound together with the host's. Call with the APU locked.
void GameHook_AmbientAfterLoad(uint8 last_ambient);

// Marks the ambient clear the hook layer is about to raise as OURS, so the report below skips it.
//
// The clear id does two unrelated jobs. The game raises it to mean "the bed ends here", which the
// host has to hear. The hook layer raises the SAME id to silence the chip's copy of a bed it just
// handed to the host. If the host heard that one it would stop the bed it was just given, which
// is precisely how a state load came to restore its music and its thunder but no rain. One flag,
// consumed by the next report, keeps the two apart.
void GameHook_MarkSelfRaisedAmbientClear(void);

// Whether |track|, after the host's remapping, is the music already playing: 1/0, or -1 when the
// host cannot say and the caller should use the vanilla compare.
int GameHook_MusicIsPlayingRemapped(uint8 track);

// The music byte a death/save-quit respawn should queue, given the starting-point table's own
// |vanilla| byte. Resolves the spawn room to its entrance so the remap that follows is keyed to
// the right interior and not to the door used before dying. Identity unless external music.
uint8 GameHook_StartingPointMusic(int starting_point, uint8 vanilla);

// The music byte the game should use for |entrance|, given the table's own |vanilla| byte. Hands back
// a real indoor song in place of a duck or an overworld song when the host's pack has a track for
// that entrance, so the host's remap can reach it. Identity unless external music is on.
uint8 GameHook_EntranceMusic(int entrance, uint8 vanilla);

// ─── Sound (sound_hooks.c) ───

// The three sound-effect ports the audio NMI writes, in the order it writes them. Ambient (APUI01)
// carries the looping environment sound; the two sfx channels (APUI02/APUI03) carry one-shots and the
// game picks whichever is free. An id means a different sound per channel, so a claim is per channel.
enum {
  kSoundChannel_Ambient = 0,
  kSoundChannel_Sfx1 = 1,
  kSoundChannel_Sfx2 = 2,
  kSoundChannel_Count = 3,
};

// Record which of the 64 sound ids the host can play on |channel|, as a bitmask pair (ids 0-31 in
// |low|, 32-63 in |high|). Out-of-range channels are ignored.
void GameHook_SetSoundClaim(int channel, uint32 low, uint32 high);

// Report one sound the game wants played, and answer whether the host took it. True means the host
// has claimed this id, and that is also the signal NOT to write the port, so the chip stays silent for
// it. Gated on kHostGate_ExternalAmbient / kHostGate_ExternalSfx: zero host-calls when off.
bool GameHook_Sound(int channel, uint8 raw);

// Whether the host claims |id| on |channel|. The predicate alone, with no report and no gate check.
bool GameHook_SoundClaimed(int channel, uint8 id);

// Diagnostics only: report one raise to the host's sound trace, gated on kHostGate_SoundTrace.
// Never changes what plays. GameHook_Sound calls it for every raise it sees; the after-load bed
// report calls it itself because it never goes through GameHook_Sound.
void GameHook_TraceSound(int channel, uint8 id, uint8 pan, bool claimed);

#endif // GAME_HOOKS_H
