/* @layer core-game-hooks @kind native */
// The foreign icons' own palette bank. The pool icons were drawn for other games, in greys and
// hues no sprite row of this one holds (the fused shadow's greys, the egg's pink), so the host
// picks 15 colours from the icons' own pixels and ships them after the pictures
// (foreign-icons.4bpp, see foreign_icon.c). They live in a private CGRAM bank past the
// hardware's 256 entries (kPpuForeignIconPalBase), and only the OAM slots that hold an icon
// resolve against it.
//
// Why a private bank and not a borrowed row. Rewriting one sprite row's CGRAM for the frames an
// icon shows would recolour every other sprite on that row for those frames (villagers,
// followers, enemies, the other receipts on row 4). The bank is the route the player's custom
// sheet already takes (player_sprite.c): the PPU marks the chosen slots' pixels in the z-buffer
// and resolves them against the bank by colour index alone, whatever row their OAM entry names.
// The zbuf has no free bit, so the icon shares the player's raised layer nibble and adds its
// low bit, which a sprite never sets (ZBUF_FOREIGN_ICON_BIT in ppu.c). A slot is marked by the
// draw that wrote it, never by its tiles or its row, so a sprite that happens to use the same
// row or the same tiles keeps its colours: nothing but the icon's own entries can change.
//
// Per frame: the draws mark the slots they wrote (GameHook_ForeignIconMarkOam); the frame end
// hands the marks and the bank to the PPU and clears them for the next frame. A frame with no
// icon, the gate clear or no bank loaded leaves the PPU's switch off, so every such frame draws
// byte for byte as before. The sheen's glint takes the bank's lightest colour over an icon
// (GameHook_ForeignIconSheenIndex), since the row's lightest index means another colour here.
// Nothing here touches WRAM or the save block.
#include "game_hooks_internal.h"

#define BANK_COLORS 16
#define OAM_SLOTS 128

static uint16 g_bank[BANK_COLORS];
static bool g_bank_loaded;
static uint8 g_bank_lightest;
static uint8 g_marks[OAM_SLOTS];  // the slots this frame's draws gave an icon
static bool g_marked;

static bool BankGate(void) {
  return g_bank_loaded && (enhanced_features5 & kFeatures5_ApOnline) != 0;
}

// The brightest entry, as the sheen measures a row (item_sheen.c LightestIndex).
static uint8 LightestOf(const uint16 *bank) {
  uint8 best = 0;
  int best_level = -1;
  for (int i = 1; i < BANK_COLORS; i++) {
    int level = (bank[i] & 31) + ((bank[i] >> 5) & 31) + ((bank[i] >> 10) & 31);
    if (level > best_level) {
      best_level = level;
      best = (uint8)i;
    }
  }
  return best;
}

void ForeignIconBank_Load(const uint8 *words) {
  for (int i = 0; i < BANK_COLORS; i++) g_bank[i] = (uint16)(words[i * 2] | words[i * 2 + 1] << 8);
  g_bank[0] = 0;  // index 0 is transparent and never sampled
  g_bank_lightest = LightestOf(g_bank);
  g_bank_loaded = true;
}

void ForeignIconBank_Clear(void) {
  g_bank_loaded = false;
}

void GameHook_ForeignIconMarkOam(const OamEnt *from, const OamEnt *to) {
  if (!BankGate()) return;
  for (const OamEnt *e = from; e < to; e++) {
    int slot = (int)(e - oam_buf);
    if (slot < 0 || slot >= OAM_SLOTS) continue;
    g_marks[slot] = 1;
    g_marked = true;
  }
}

void GameHook_ForeignIconBankFrameEnd(void) {
  Ppu *ppu = g_zenv.ppu;
  bool active = g_marked && BankGate() && ppu != NULL;
  if (active) {
    memcpy(ppu->oamIsForeignIcon, g_marks, sizeof(g_marks));
    memcpy(&ppu->cgram[kPpuForeignIconPalBase], g_bank, sizeof(g_bank));
  }
  if (ppu != NULL && ppu->foreignIconPalActive != active) ppu->foreignIconPalActive = active;
  if (g_marked) memset(g_marks, 0, sizeof(g_marks));
  g_marked = false;
}

uint8 GameHook_ForeignIconSheenIndex(uint8 native) {
  return BankGate() && ForeignIcon_SlotHoldsPicture() ? g_bank_lightest : native;
}
