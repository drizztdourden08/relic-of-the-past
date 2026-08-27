/* @layer core-game-hooks @kind native */
#include "gba_alttp_internal.h"

#include "src/variables.h"
#include "src/zelda_rtl.h"
#include "snes/ppu.h"

/**
 * Shade the player while he is under the water.
 *
 * The cartridge gets this for free: it puts a diving player behind the water and the water is
 * already half-transparent over what it covers, so the surface is painted across him. Neither
 * half of that translates directly here. The surface is not on the main screen at all - it is
 * the sub-screen layer colour maths mixes in - so no sprite depth sits under it; and opening
 * colour maths up to sprites, which was the obvious next lever, tints every sprite in the room
 * rather than the one that went under.
 *
 * What does reach exactly one sprite is the renderer's private player bank: sixteen colours past
 * the hardware palette that the player's own pixels, and only those, resolve against. Filling it
 * with his colours already mixed half-and-half with the water gives the same picture the blend
 * would have, and nothing else in the room can see it.
 */

enum {
  kPlayerPalRow = 0xf0,   /* the shared sprite row the player draws from */
  kWaterPalRow = 0x70,    /* the background row the surface is drawn in */
  kWaterSample = 4,       /* a mid entry of it, standing in for the surface's colour */
  kBankColors = 16,
};

static bool g_tinted;
static bool g_saved_active;
static uint16 g_saved_bank[kBankColors];

/** Half of each channel of one colour plus half of the other, in the PPU's own 5-bit packing. */
static uint16 MixHalf(uint16 a, uint16 b) {
  uint16 r = (((a & 0x1f) + (b & 0x1f)) >> 1) & 0x1f;
  uint16 g = ((((a >> 5) & 0x1f) + ((b >> 5) & 0x1f)) >> 1) & 0x1f;
  uint16 bl = ((((a >> 10) & 0x1f) + ((b >> 10) & 0x1f)) >> 1) & 0x1f;
  return (uint16)(r | (g << 5) | (bl << 10));
}

static void Restore(Ppu *ppu) {
  if (!g_tinted)
    return;
  for (int i = 0; i < kBankColors; i++)
    ppu->cgram[kPpuPlayerPalBase + i] = g_saved_bank[i];
  ppu->playerPalActive = g_saved_active;
  g_tinted = false;
}

void GbaAlttp_SyncDiveTint(void) {
  Ppu *ppu = g_zenv.ppu;
  if (ppu == NULL)
    return;
  if (!g_ram[kRam_DiveTimer] || !GbaAlttp_IsWaterRoom()) {
    Restore(ppu);
    return;
  }
  if (!g_tinted) {
    for (int i = 0; i < kBankColors; i++)
      g_saved_bank[i] = ppu->cgram[kPpuPlayerPalBase + i];
    g_saved_active = ppu->playerPalActive;
    g_tinted = true;
  }
  /* Re-mixed every frame rather than once: the gear palette changes under us on a damage flash
     or a sheet swap, and a bank filled at the start of the dive would keep the old colours. */
  uint16 water = ppu->cgram[kWaterPalRow + kWaterSample];
  ppu->cgram[kPpuPlayerPalBase] = 0;  /* index 0 is transparent and never sampled */
  for (int i = 1; i < kBankColors; i++)
    ppu->cgram[kPpuPlayerPalBase + i] = MixHalf(ppu->cgram[kPlayerPalRow + i], water);
  ppu->playerPalActive = true;
}
