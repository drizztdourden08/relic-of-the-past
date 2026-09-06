/* @layer core-game-hooks @kind native */
// Dungeon prize shuffle — the seam that lets a boss's falling reward be any item, and the
// ten rewards themselves be placed like any other item.
//
// Two facts of the vanilla design make this more than a substitution table:
//
// 1. "Dungeon cleared" IS the prize bit. RoomTag_GetHeartForPrize respawns the falling
//    reward, and RoomTag_PrizeTriggerDoorDoor opens the arena's exit door, from the SAME
//    test: does the save carry this dungeon's own pendant/crystal bit. Substituting the
//    reward never sets that bit, so unfixed the reward respawns forever and the door
//    never opens. The two states are separated here: a hook-owned save bit records that
//    THIS dungeon's reward was handed over, and the two room tags read it alongside the
//    vanilla expression. The pendant/crystal bit stays what it always was — the
//    inventory record of owning that reward — so it is set only when the reward really
//    is the item received.
// 2. A crystal has ONE receive id (0x20) for all seven; which crystal it banks comes from
//    the room the player is standing in (ancilla.c's rising crystal). An assigned crystal
//    must bank the one the SEED named, so the seven gain virtual receive ids (0x7B-0x81,
//    just past the progressive-capacity span) that a substitution table can carry. The
//    resolver banks the bit and leaves the vanilla receive id behind it, so the receipt,
//    the cutscene and the warp out are the game's own, unchanged. The three pendants need
//    none of this: their native ids (0x37/0x38/0x39) each bank a fixed bit already, so a
//    pendant is a normal item wherever it is placed.
//
// Gate: kFeatures3_PrizeShuffle. Off, every entry point here returns the caller's own
// vanilla expression and no save byte is written.
#include "game_hooks_internal.h"
#include "save_bytes.h"

// The seven crystals, in the order the reference numbers them (Crystal 1..7).
#define PRIZE_VIRT_FIRST 0x7B
#define PRIZE_VIRT_COUNT 7
#define PRIZE_VIRT_LAST (PRIZE_VIRT_FIRST + PRIZE_VIRT_COUNT - 1)
// The native receive id every crystal presents as.
#define PRIZE_CRYSTAL_ITEM 0x20

// Save bytes — addresses allocated in save_bytes.h, THE registry. Two bytes carrying one
// bit per palace index (0-12) for "this dungeon's reward was handed over", and one byte
// naming the crystal the receipt in flight must bank (0 for none). Nothing here reads or
// writes another owner's byte.
#define srm_prize_taken_lo (*(uint8 *)(g_ram + SRM_PRIZE_TAKEN))
#define srm_prize_taken_hi (*(uint8 *)(g_ram + SRM_PRIZE_TAKEN + 1))
#define srm_pending_crystal (*(uint8 *)(g_ram + SRM_PENDING_CRYSTAL))

// Crystal N's bit in link_has_crystals, indexed by virtual id. Same values as the
// reference's item table and as kDungeonCrystalPendantBit for each crystal's own dungeon.
static const uint8 kPrizeCrystalBit[PRIZE_VIRT_COUNT] = {0x02, 0x10, 0x40, 0x20, 0x04, 0x01, 0x08};

// The four native receive ids a boss's falling reward can carry.
static bool IsVanillaPrizeItem(uint8 item) {
  return item == PRIZE_CRYSTAL_ITEM || item == 0x37 || item == 0x38 || item == 0x39;
}

static bool PrizeGate(void) {
  return (enhanced_features3 & kFeatures3_PrizeShuffle) != 0;
}

// The one sanctioned extension of the 76-entry native bound, alongside GameHook_IsVirtualGrantId.
bool GameHook_IsPrizeGrantId(uint8 item) {
  return item >= PRIZE_VIRT_FIRST && item <= PRIZE_VIRT_LAST;
}

// Pure presentation lookup for the draw seams: a crystal id draws as the native crystal.
uint8 GameHook_PrizePresentationOf(uint8 item) {
  return GameHook_IsPrizeGrantId(item) ? PRIZE_CRYSTAL_ITEM : item;
}

// Bank crystal |bit| and remember it for the rising-crystal seam. The bit is banked HERE
// rather than left to that seam so an interrupted cutscene cannot lose the item; the seam
// then re-ORs the same bit, which is idempotent.
static void BankCrystal(uint8 bit) {
  link_has_crystals |= bit;
  srm_pending_crystal = bit;
}

// Resolve a grant id for the receive flow: a crystal id banks its bit and becomes the
// native crystal receipt, every other id passes through untouched. Composes after
// GameHook_ResolveGrantItem (which leaves ids past its own span alone), so a seam resolves
// both families in one line. With the gate down — or no substitution seam open — nothing is
// banked and the caller still gets a valid native id instead of an out-of-range one.
uint8 GameHook_ResolvePrizeItem(uint8 item) {
  if (!GameHook_IsPrizeGrantId(item)) return item;
  if (!PrizeGate() || !GrantSeamOpen()) return PRIZE_CRYSTAL_ITEM;
  uint8 bit = kPrizeCrystalBit[item - PRIZE_VIRT_FIRST];
  BankCrystal(bit);
  printf("[Randomizer] Prize grant resolved: 0x%02x -> crystal bit 0x%02x\n", item, bit);
  return PRIZE_CRYSTAL_ITEM;
}

// The rising crystal's bit (ancilla.c). |vanilla_bit| is the room's own crystal — the
// correct answer for an unshuffled reward and the only answer with the gate down. With an
// assigned crystal in flight it is that one instead, consumed so the next reward starts clean.
uint8 GameHook_CrystalPrizeBit(uint8 vanilla_bit) {
  if (!PrizeGate()) return vanilla_bit;
  uint8 pending = srm_pending_crystal;
  if (pending == 0) return vanilla_bit;
  srm_pending_crystal = 0;
  return pending;
}

static bool TakenBit(int palace) {
  if (palace < 0 || palace >= 16) return false;
  uint8 stored = palace < 8 ? srm_prize_taken_lo : srm_prize_taken_hi;
  return (stored & (uint8)(1u << (palace & 7))) != 0;
}

static void MarkTaken(int palace) {
  if (palace < 0 || palace >= 16) return;
  uint8 mask = (uint8)(1u << (palace & 7));
  if (palace < 8) srm_prize_taken_lo |= mask;
  else srm_prize_taken_hi |= mask;
}

// The two boss-room tags' "this dungeon's reward is already claimed" test.
// |vanilla_flagged| is the caller's own expression (the dungeon's pendant/crystal bit
// masked out of the matching set), passed in so the gate-down answer is that expression
// verbatim. Gate up, a claimed-but-substituted reward answers true through the hook bit.
bool GameHook_DungeonPrizeTaken(int vanilla_flagged) {
  if (vanilla_flagged != 0) return true;
  if (!PrizeGate()) return false;
  return TakenBit(BYTE(cur_palace_index_x2) >> 1);
}

// Record that the reward of the dungeon the player is standing in was handed over. Called
// from the substitution seam (npc_overrides.c) for every grant it applies: only a falling
// boss reward qualifies — receipt method 3 carrying one of the four native reward ids —
// so an ordinary gift in the same room can never mark a dungeon cleared.
void GameHook_NoteDungeonPrizeGrant(uint8 vanilla_item) {
  if (!PrizeGate()) return;
  if (item_receipt_method != 3 || !IsVanillaPrizeItem(vanilla_item)) return;
  int palace = BYTE(cur_palace_index_x2) >> 1;
  MarkTaken(palace);
  printf("[Randomizer] Dungeon prize claimed: palace %d (vanilla item 0x%02x)\n", palace, vanilla_item);
}

// Read side for the host and the probes: the claimed mask (palaces 0-7 low byte, 8-15
// high) and the crystal a receipt in flight will bank. Ungated like
// GameHook_SubstitutedGiftTaken — the bytes are only ever WRITTEN under the gate.
int GameHook_PrizeTakenMask(void) {
  return srm_prize_taken_lo | (srm_prize_taken_hi << 8);
}

uint8 GameHook_PendingPrizeCrystal(void) {
  return srm_pending_crystal;
}

// The delivery path (receipt_grant.c). A crystal arriving from the queue cannot ride the
// native crystal receipt: that receipt ends ONLY by transmuting into the rising crystal,
// whose cutscene submodule is a dungeon-exit sequence with no meaning outdoors. So the bit
// is banked directly and the queue is told the item landed. True when |item| was a crystal
// id and was handled here.
bool GameHook_DeliverPrizeItem(uint8 item) {
  if (!GameHook_IsPrizeGrantId(item)) return false;
  if (!PrizeGate()) {
    printf("[Randomizer] Prize delivery refused: prize shuffle gate is down (0x%02x)\n", item);
    return true;
  }
  uint8 bit = kPrizeCrystalBit[item - PRIZE_VIRT_FIRST];
  link_has_crystals |= bit;
  overworld_map_state++;
  printf("[Randomizer] Prize delivered: 0x%02x -> crystal bit 0x%02x\n", item, bit);
  return true;
}
