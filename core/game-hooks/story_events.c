/* @layer core-game-hooks @kind native */
// Story gates read from what was RECORDED, never from what is being carried.
//
// The game keeps almost no event log. Where it needs to know how far a file has come it reads an
// ITEM and treats owning it as proof, which holds in the unmodified game because the item can only
// be obtained at one point in the story. Hand items out at any time (a cheat, a seed) and the proof
// is worthless: the file looks past a beat it never reached, and the scenes for that beat are
// skipped or replaced with no way back.
//
// Every gate here takes the call site's own vendored expression and returns it untouched while its
// word-5 field is zero (features.h kFeatures5_*). With the field set it answers from a recorded
// event: a vanilla battery bit where the game keeps one, the ledger (events/) where it does not,
// or a count over those. The fields live in the WRAM gate word, not a host gate, because the GAME
// branches on them: a host gate would be invisible to a save state and desynchronise a replay.
#include "game_hooks_internal.h"
#include "events/event_ids.h"

// ─── The blade drawn from its pedestal ──────────────────────────────────────────────────────────
// MasterSword_Main sets bit 0x40 of the pedestal screen's overworld event byte in the same breath as
// the grant; the screen is 0x80, so that byte IS savegame_has_master_sword_flags. It sits in the
// battery block, is set exactly when the ceremony completes, and every file written before this
// hook carries it correctly. Nothing to migrate.
#define PEDESTAL_CLAIMED_BIT 0x40

extern const uint8 kDungeonCrystalPendantBit[13];

// The boss room of each palace, by palace index (cur_palace_index_x2 >> 1). The heart bit there is
// the game's own "boss finished" record. A slot no dungeon record claims holds 0, and so does
// Hyrule Castle, which has no boss room at all.
/* generated: begin kBossRoomByPalace */
static const uint16 kBossRoomByPalace[14] = {
  0, 0, 0xC8, 0x33, 0x20, 0x06, 0x5A, 0x90, 0x29, 0xDE, 0x07, 0xAC, 0xA4, 0x0D,
};
/* generated: end kBossRoomByPalace */
#define PALACE_EASTERN 2
#define PALACE_DESERT 3
#define PALACE_AGAHNIM 4
#define PALACE_HERA 10
#define PALACE_ICE 9
#define PALACE_MIRE 7
#define PALACE_GANON 13
#define HEART_TAKEN_BIT 0x800

static uint32 Field(uint32 mask, uint32 shift) { return (enhanced_features5 & mask) >> shift; }
static bool Bit(uint32 mask) { return (enhanced_features5 & mask) != 0; }

// A seed is running when any override table is armed: then the ledger alone is the truth, since
// the file has recorded from its first frame. Outside a seed an older file may predate the ledger,
// so the vendored item reading stays as a fallback.
static bool SeedArmed(void) {
  return (enhanced_features3 & (kFeatures3_ItemOverrides | kFeatures3_NpcOverrides | kFeatures3_StandingOverrides)) != 0;
}

bool GameHook_PedestalClaimed(void) {
  if (!Bit(kFeatures5_PedestalScenes)) return link_sword_type >= 2;
  return (savegame_has_master_sword_flags & PEDESTAL_CLAIMED_BIT) != 0;
}

static bool HeartTaken(int palace) {
  return palace >= 0 && palace <= 13 && (save_dung_info[kBossRoomByPalace[palace]] & HEART_TAKEN_BIT) != 0;
}

static bool BossKilled(int palace) {
  return GameHook_HasEvent((EventId)(kEvent_BossKilled_Sewers + palace)) || HeartTaken(palace);
}

static bool VanillaPrizeHeld(int palace) {
  if (palace < 0 || palace > 12) return false;
  uint8 bit = kDungeonCrystalPendantBit[palace];
  if (bit == 0) return false;
  bool pendant = palace == PALACE_EASTERN || palace == PALACE_DESERT || palace == PALACE_HERA;
  return ((pendant ? link_which_pendants : link_has_crystals) & bit) != 0;
}

// The falling reward was picked up: the ledger, or on a file older than it, the heart taken and
// this dungeon's own reward in hand.
bool GameHook_PrizeTaken(int palace) {
  if (GameHook_HasEvent((EventId)(kEvent_PrizeTaken_Sewers + palace))) return true;
  return HeartTaken(palace) && VanillaPrizeHeld(palace);
}

// For a gate, "cleared" is the boss and the reward; the two tower fights have no reward.
static bool DungeonCleared(int palace) {
  if (palace == PALACE_AGAHNIM || palace == PALACE_GANON) return BossKilled(palace);
  return BossKilled(palace) && GameHook_PrizeTaken(palace);
}

static int PopCount(uint32 v) { int n = 0; while (v) { n += v & 1; v >>= 1; } return n; }
static int PendantsHeld(void) { return PopCount(link_which_pendants & 7); }
static int CrystalsHeld(void) { return PopCount(link_has_crystals & 0x7f); }
static int LightWorldCleared(void) {
  return DungeonCleared(PALACE_EASTERN) + DungeonCleared(PALACE_DESERT) + DungeonCleared(PALACE_HERA);
}
static int DarkWorldCleared(void) {
  static const uint8 kDark[7] = { 5, 6, 7, 8, 9, 11, 12 };
  int n = 0;
  for (int i = 0; i < 7; i++) n += DungeonCleared(kDark[i]);
  return n;
}
static int DungeonsCleared(void) { return LightWorldCleared() + DarkWorldCleared(); }

static bool CountMet(uint32 count, bool dungeons) {
  return (dungeons ? DarkWorldCleared() : CrystalsHeld()) >= (int)count;
}

static bool TowerCountMet(void) {
  return CountMet(Field(kFeatures5_TowerCountMask, kFeatures5_TowerCountShift), Bit(kFeatures5_TowerCountKind));
}

static bool PedestalOpen(uint32 mode) {
  switch (mode) {
    case 1: return LightWorldCleared() == 3;
    case 2: return DungeonsCleared() >= 3;
    case 3: return true;
    default: return mode >= 4 ? PendantsHeld() >= (int)(mode - 3) : (link_which_pendants & 7) == 7;
  }
}

static bool BarrierFalls(uint32 mode) {
  switch (mode) {
    case 1: return GameHook_PedestalClaimed();
    case 2: return (link_which_pendants & 7) == 7;
    default: return LightWorldCleared() == 3;
  }
}

static bool BombShopOpen(uint32 mode) {
  if (mode == 1) return DungeonCleared(PALACE_ICE) && DungeonCleared(PALACE_MIRE);
  return TowerCountMet();
}

bool GameHook_StoryGate(StoryGate gate, bool vanilla) {
  switch (gate) {
    case kGate_PedestalScenes: return Bit(kFeatures5_PedestalScenes) ? GameHook_PedestalClaimed() : vanilla;
    case kGate_Pedestal: {
      uint32 mode = Field(kFeatures5_PedestalGateMask, kFeatures5_PedestalGateShift);
      return mode ? PedestalOpen(mode) : vanilla;
    }
    case kGate_Sahasrahla: return Bit(kFeatures5_SahasrahlaGate) ? DungeonCleared(PALACE_EASTERN) : vanilla;
    case kGate_Barrier: {
      uint32 mode = Field(kFeatures5_BarrierGateMask, kFeatures5_BarrierGateShift);
      return mode ? BarrierFalls(mode) : vanilla;
    }
    case kGate_BombShop: {
      uint32 mode = Field(kFeatures5_BombShopGateMask, kFeatures5_BombShopGateShift);
      if (mode) return BombShopOpen(mode);
      // The vendored test asks for the smiths too; the smith bit alone can be waived.
      if (Bit(kFeatures5_BombShopSmith)) return (link_has_crystals & 5) == 5;
      return vanilla;
    }
    case kGate_Tower: return Field(kFeatures5_TowerCountMask, kFeatures5_TowerCountShift) || Bit(kFeatures5_TowerCountKind)
      ? TowerCountMet() : vanilla;
    case kGate_Ganon: {
      uint32 count = Field(kFeatures5_GanonCountMask, kFeatures5_GanonCountShift);
      bool kind = Bit(kFeatures5_GanonCountKind);
      return (count || kind) ? (vanilla && CountMet(count, kind)) : vanilla;
    }
    case kGate_HeraMusic: return Bit(kFeatures5_HeraMusic) ? BossKilled(PALACE_HERA) : vanilla;
    case kGate_Vane: return Bit(kFeatures5_VaneScene) ? (save_ow_event_info[0x18] & 0x20) != 0 : vanilla;
    case kGate_MountainRespawn: return Bit(kFeatures5_MountainRespawn) ? GameHook_HasEvent(kEvent_OldManRescued) : vanilla;
    default: return vanilla;
  }
}

// A possession-gated re-offer with no giver bit of its own reads the ledger: the item may have
// come from anywhere. Outside a seed an older file keeps the item reading as a fallback.
bool GameHook_GiverTaken(EventId id, bool vanilla) {
  if (!Bit(kFeatures5_GiverReoffer)) return vanilla;
  return GameHook_HasEvent(id) || (!SeedArmed() && vanilla);
}

// The stump's offer keys on the flute slot: 0 offers the shovel, 1 asks after the flute, 2 and 3
// thank the player. With the ledger the shovel's own fact decides the first two.
int GameHook_StumpState(int vanilla) {
  if (!Bit(kFeatures5_GiverReoffer)) return vanilla;
  bool given = GameHook_HasEvent(kEvent_ShovelFromStump) || (!SeedArmed() && vanilla != 0);
  if (!given) return 0;
  return vanilla == 0 ? 1 : vanilla;
}

// The pyramid hole modes: open from the start, or once the tower count is met. Both are a write of
// the game's own bit, the way the reference randomizer patches it in, so the rest of the game reads
// the hole exactly as it does after the second tower fight.
void GameHook_StoryGatesFrameEnd(void) {
  uint32 mode = Field(kFeatures5_PyramidHoleMask, kFeatures5_PyramidHoleShift);
  if (mode == 0 || (save_ow_event_info[0x5b] & 0x20)) return;
  if (mode == 1 || (mode == 2 && TowerCountMet())) save_ow_event_info[0x5b] |= 0x20;
}

// The counts the gates compute, for the probes (story_probes.c).
int GameHook_StoryCount(int which) {
  switch (which) {
    case 0: return PendantsHeld();
    case 1: return CrystalsHeld();
    case 2: return LightWorldCleared();
    case 3: return DarkWorldCleared();
    default: return DungeonsCleared();
  }
}
