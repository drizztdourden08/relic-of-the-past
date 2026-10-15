/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"
#include "save_bytes.h"

// ─── Substitution-completion bits ───
// Several givers have no real completion flag: their scripts gate on POSSESSION of the
// vanilla item, which substitution never grants, so the check would re-offer forever
// and nothing persistent would say it completed. These three bytes are the missing bits.
//
// Their addresses, and the reason a save byte can live in the battery block at all, are
// in save_bytes.h, THE registry, where every hook-owned address is allocated once.
// Exposed to the host as progress-buffer bytes [21], [22] and [25] (state_queries.c).
//
// One bit per substitutable possession-gated giver, keyed by the VANILLA receive id its
// script grants (unique per giver). Byte 0 bits 0-7, byte 1 bits 0-6, byte 2 bits 0-2;
// the rest reserved. Keys 0xF0 and above are SYNTHETIC: allocation handles for grants
// whose script has no vanilla receive id at all (the upgrade pond's two purchases, the
// cave bat); they can never collide with a real id at the receive seam and are written
// via GameHook_MarkSubstitutionKey.
#define srm_substitution_taken(byte_index) (*(uint8 *)(g_ram + SRM_SUBSTITUTION_TAKEN + (byte_index)))

typedef struct {
  uint8 vanilla_item;
  uint8 byte_index;
  uint8 mask;
} SubstitutionBit;
static const SubstitutionBit kSubstitutionBits[] = {
  {0x1e, 0, 0x01},  // the river king's swim gear
  {0x4b, 0, 0x02},  // the first sage's running gear
  {0x21, 0, 0x04},  // the sick child's catching net
  {0x1a, 0, 0x08},  // the escorted elder's reflector
  {0x11, 0, 0x10},  // the whirlpool dweller's third medallion
  {0x29, 0, 0x20},  // the standing fungus
  {0x1d, 0, 0x40},  // the shelved tome
  {0x14, 0, 0x80},  // the dug-up instrument
  {0x0f, 1, 0x01},  // the desert tablet's medallion
  {0x10, 1, 0x02},  // the mountain tablet's medallion
  {0x02, 1, 0x04},  // the smithy's tempered blade (its record's flag bit has no vanilla writer)
  // The wish ponds' four gear upgrades: each grant crosses the receive seam with a
  // unique vanilla id, but writes no completion flag of its own.
  {0x2a, 1, 0x08},  // the wish pond's returning-weapon upgrade
  {0x05, 1, 0x10},  // the wish pond's guard-gear upgrade
  {0x03, 1, 0x20},  // the cursed pond's final blade tier
  {0x3b, 1, 0x40},  // the cursed pond's piercing-shot upgrade
  // Synthetic keys (no vanilla receive id exists for these grants at all):
  {0xf0, 2, 0x01},  // the upgrade pond's explosives-capacity purchase
  {0xf1, 2, 0x02},  // the upgrade pond's projectiles-capacity purchase
  {0xf2, 2, 0x04},  // the cave bat's meter upgrade
  // Real receive id, filed after the synthetic keys because byte 2 had the free bits:
  {0x13, 2, 0x08},  // the haunted stump's digging tool
  // The ceremonial blade's pedestal needs no bit: its own script writes a real
  // overworld event bit at the grant, which detection already reads.
};

static const SubstitutionBit *FindSubstitutionBit(uint8 vanilla_item) {
  for (size_t i = 0; i < sizeof(kSubstitutionBits) / sizeof(kSubstitutionBits[0]); i++) {
    if (kSubstitutionBits[i].vanilla_item == vanilla_item) return &kSubstitutionBits[i];
  }
  return NULL;
}

static void MarkGrantSubstituted(uint8 vanilla_item) {
  const SubstitutionBit *bit = FindSubstitutionBit(vanilla_item);
  if (bit == NULL) return;
  srm_substitution_taken(bit->byte_index) |= bit->mask;
}

// The synthetic-key write path for grants with no vanilla receive id (scripted_grants.c).
// Gated by construction: only the gated substitution hooks call it.
void GameHook_MarkSubstitutionKey(uint8 key) {
  MarkGrantSubstituted(key);
}

// Read side for the vendored re-offer gates and the host: true once this giver's grant
// was substituted. Deliberately ungated: the bit is only ever WRITTEN by a substitution
// (which answers to kFeatures3_NpcOverrides), and once a check's item went out, the
// giver must stay closed even if the session later stops or Vanilla Safe engages.
bool GameHook_SubstitutedGiftTaken(uint8 vanilla_item) {
  const SubstitutionBit *bit = FindSubstitutionBit(vanilla_item);
  if (bit == NULL) return false;
  return (GameHook_SubstitutionTakenByte(bit->byte_index) & bit->mask) != 0;
}

uint8 GameHook_SubstitutionTakenByte(int byte_index) {
  return srm_substitution_taken(byte_index == 0 || byte_index == 1 ? byte_index : 2);
}
