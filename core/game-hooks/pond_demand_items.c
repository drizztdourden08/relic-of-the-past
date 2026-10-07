/* @layer core-game-hooks @kind native */
// Whether the player holds the item an item demand names, and the picture its toss shows.
//
// An item demand is paid by SHOWING: the player throws the item in as proof, the throw is drawn,
// and the item never leaves the pack. So the whole payment is a possession read, and that read
// has to be exact. Each rule below is the inventory byte the vendored receive routine writes for
// that receive id (misc.c kMemoryLocationToGiveItemTo / kValueToGiveItemTo) and the range of
// values that byte holds once the item is owned, so a higher tier of a family counts as holding
// the lower one, the way the game itself treats a stronger blade.
//
// A progressive family's virtual id (progressive_grants.c, 0x62-0x66) is held once its first
// tier is, and its toss shows the tier held now. A dungeon prize is held while its own bit is
// set: a pendant's native id banks a fixed bit, and a crystal's virtual id (prize_grants.c,
// 0x7B-0x81) names one crystal's bit and throws as the native crystal. Every other id (a key, a
// map, a counted pickup, an upgrade) is never held here, so a demand naming one is never paid.
//
// Pure reads. Nothing is gated here: the only caller is the gated demand visit.
#include "game_hooks_internal.h"
#include "pond_toss.h"

// One rule: receive id |id| is held while the byte at |addr| reads |lo| to |hi|.
typedef struct {
  uint8 id;
  uint16 addr;
  uint8 lo;
  uint8 hi;
} HeldRule;

static const HeldRule kHeldRules[] = {
  {0x49, 0xF359, 1, 4}, {0x00, 0xF359, 1, 4}, {0x01, 0xF359, 2, 4}, {0x02, 0xF359, 3, 4},
  {0x03, 0xF359, 4, 4}, {0x04, 0xF35A, 1, 3}, {0x05, 0xF35A, 2, 3}, {0x06, 0xF35A, 3, 3},
  {0x07, 0xF345, 1, 255}, {0x08, 0xF346, 1, 255}, {0x09, 0xF34B, 1, 255}, {0x0A, 0xF342, 1, 255},
  {0x0B, 0xF340, 1, 4}, {0x3A, 0xF340, 1, 4}, {0x3B, 0xF340, 3, 4}, {0x0C, 0xF341, 1, 2},
  {0x2A, 0xF341, 2, 2}, {0x29, 0xF344, 1, 1}, {0x0D, 0xF344, 2, 2}, {0x0F, 0xF347, 1, 255},
  {0x10, 0xF348, 1, 255}, {0x11, 0xF349, 1, 255}, {0x12, 0xF34A, 1, 255}, {0x13, 0xF34C, 1, 1},
  {0x14, 0xF34C, 2, 3}, {0x4A, 0xF34C, 3, 3}, {0x15, 0xF350, 1, 255}, {0x18, 0xF351, 1, 255},
  {0x19, 0xF352, 1, 255}, {0x1A, 0xF353, 2, 255}, {0x1B, 0xF354, 1, 2}, {0x1C, 0xF354, 2, 2},
  {0x1D, 0xF34E, 1, 255}, {0x1E, 0xF356, 1, 255}, {0x1F, 0xF357, 1, 255}, {0x21, 0xF34D, 1, 255},
  {0x22, 0xF35B, 1, 2}, {0x23, 0xF35B, 2, 2}, {0x4B, 0xF355, 1, 255},
};
#define HELD_RULE_COUNT ((int)(sizeof(kHeldRules) / sizeof(kHeldRules[0])))

// A dungeon prize: held while |mask| is set in the byte at |addr|, thrown as |picture|.
typedef struct {
  uint8 id;
  uint16 addr;
  uint8 mask;
  uint8 picture;
} HeldBit;

// The pendant bits are the ones the vendored receipt ORs in (misc.c AncillaAdd_ItemReceipt); the
// crystal bits are prize_grants.c's own table, Crystal 1 to 7.
static const HeldBit kHeldBits[] = {
  {0x37, 0xF374, 0x04, 0x37}, {0x38, 0xF374, 0x01, 0x38}, {0x39, 0xF374, 0x02, 0x39},
  {0x7B, 0xF37A, 0x02, 0x20}, {0x7C, 0xF37A, 0x10, 0x20}, {0x7D, 0xF37A, 0x40, 0x20}, {0x7E, 0xF37A, 0x20, 0x20},
  {0x7F, 0xF37A, 0x04, 0x20}, {0x80, 0xF37A, 0x01, 0x20}, {0x81, 0xF37A, 0x08, 0x20},
};
#define HELD_BIT_COUNT ((int)(sizeof(kHeldBits) / sizeof(kHeldBits[0])))

static const HeldBit *PrizeOf(uint8 id) {
  for (int i = 0; i < HELD_BIT_COUNT; i++) {
    if (kHeldBits[i].id == id) return &kHeldBits[i];
  }
  return NULL;
}

// A filled bottle's receive id and the value its slot holds (shop_payment.h names the values).
static const uint8 kBottleIds[][2] = {
  {0x2B, 3}, {0x2C, 4}, {0x2D, 5}, {0x3D, 6}, {0x3C, 7}, {0x48, 8},
};
#define BOTTLE_ID_COUNT ((int)(sizeof(kBottleIds) / sizeof(kBottleIds[0])))

// A progressive family: the byte its tier lives in, and the receive id of each tier from 1.
typedef struct {
  uint8 id;
  uint16 addr;
  uint8 tiers[4];
} HeldFamily;

// The bow keeps two values per tier (without and with arrows), hence 0x0B twice.
static const HeldFamily kHeldFamilies[] = {
  {0x62, 0xF359, {0x49, 0x01, 0x02, 0x03}},
  {0x63, 0xF35A, {0x04, 0x05, 0x06, 0x06}},
  {0x64, 0xF354, {0x1B, 0x1C, 0x1C, 0x1C}},
  {0x65, 0xF35B, {0x22, 0x23, 0x23, 0x23}},
  {0x66, 0xF340, {0x0B, 0x0B, 0x3B, 0x3B}},
};
#define HELD_FAMILY_COUNT ((int)(sizeof(kHeldFamilies) / sizeof(kHeldFamilies[0])))

static const HeldFamily *FamilyOf(uint8 id) {
  for (int i = 0; i < HELD_FAMILY_COUNT; i++) {
    if (kHeldFamilies[i].id == id) return &kHeldFamilies[i];
  }
  return NULL;
}

// The family's tier held now, 1 up, or 0 for none.
static int FamilyTier(const HeldFamily *family) {
  uint8 tier = g_ram[family->addr];
  return tier >= 1 && tier <= 4 ? tier : 0;
}

static bool BottleHeld(uint8 value) {
  for (int i = 0; i < 4; i++) {
    if (value == 0 ? link_bottle_info[i] != 0 : link_bottle_info[i] == value) return true;
  }
  return false;
}

bool PondItemHeld(uint8 id) {
  const HeldFamily *family = FamilyOf(id);
  if (family != NULL) return FamilyTier(family) > 0;
  const HeldBit *prize = PrizeOf(id);
  if (prize != NULL) return (g_ram[prize->addr] & prize->mask) != 0;
  if (id == 0x16) return BottleHeld(0);
  for (int i = 0; i < BOTTLE_ID_COUNT; i++) {
    if (kBottleIds[i][0] == id) return BottleHeld(kBottleIds[i][1]);
  }
  for (int i = 0; i < HELD_RULE_COUNT; i++) {
    const HeldRule *rule = &kHeldRules[i];
    if (rule->id == id) return g_ram[rule->addr] >= rule->lo && g_ram[rule->addr] <= rule->hi;
  }
  return false;
}

// The receipt the toss shows: a family's tier held now, any other held item its own id. -1 for
// an id the player does not hold, so nothing is ever drawn for a demand that was not paid.
int PondItemTossId(uint8 id) {
  if (!PondItemHeld(id)) return -1;
  const HeldFamily *family = FamilyOf(id);
  if (family != NULL) return family->tiers[FamilyTier(family) - 1];
  const HeldBit *prize = PrizeOf(id);
  if (prize != NULL) return prize->picture;
  return id < 76 ? id : -1;
}
