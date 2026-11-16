/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Dialog letter bank ───
// Letters the active dialogue font lacks (every accented Latin letter a translation or a name can
// use), drawn by the host from the font's own letters and handed over as a bank: each entry is the
// letter's width, the font glyph it falls back to, and its two 8x8 2bpp tiles (top then bottom, 16
// bytes each). The font has far fewer free slots than the bank has letters, so a letter only takes a
// slot when a line shows it: the decode gives it one (the one used longest ago, never a slot a cell
// on the mirror's rows still shows) and writes its picture into the font copy that
// dialog_extra_glyphs.c keeps. Decoding the same letter again finds its slot, so the decode stays
// the same answer every time the engine asks.
//
// A line reaches letter k through a two-byte escape the vendored decoder has no meaning for:
//   US: 0x84-0x87 then a byte, k = (lead - 0x84) * 256 + byte. The US decoder sends any byte from
//       0x80 to a letter, never a command.
//   EU: 0x87 then 0x53-0x5f (k 0-12) or 0x89-0xff (k 13-131), sub-bytes the EU decoder has no case
//       for; 0x86 then a byte (k 132-387), the one EU command no line uses.
// Both decode to a multibyte letter, so the parse and the pump step over the second byte the way
// they step over any parameter. With the gate down, or no free slot left, a letter draws its
// fallback glyph; a letter past the bank draws the font's question mark.

enum {
  kTileBytes = 16,
  kLetterBytes = 2 + 2 * kTileBytes,
  kMaxLetters = 1024,
  kGlyphSlots = 128,
  kUsLetterFirst = 0x84,
  kUsLetterLast = 0x87,
  kPage = 256,
  kEuPrefix = 0x87,
  kEuName = 0x86,
  kEuLowFirst = 0x53,
  kEuLowLast = 0x5f,
  kEuHighFirst = 0x89,
  kEuLowCount = kEuLowLast - kEuLowFirst + 1,
  kEuNameFirst = kEuLowCount + 0x100 - kEuHighFirst,
  kQuestionGlyph = 0x3f,
  kCmdIsLetter = 25,  // messaging.c kTextCmd_IsLetter
};

// The host writes the bank here (WasmLetterBankTable) and passes its count to WasmLoadLetterBank.
static uint8 g_bank[kMaxLetters * kLetterBytes];
static int g_count;
// Per font slot: the letter it holds plus one (0 for none), and when a decode last asked for it.
static uint16 g_slot_letter[kGlyphSlots];
static uint32 g_slot_used[kGlyphSlots];
static uint32 g_clock;
// The first slot the host's own text map leaves unused; no letter goes below it.
static int g_first_slot = kGlyphSlots;
// Raised whenever a slot's picture changes, so the host knows its copy of the font is stale.
static uint32 g_generation;
// A digest of the bank last loaded, so an identical reload keeps every slot's letter.
static uint32 g_digest;

static uint32 Digest(int count) {
  uint32 hash = 2166136261u;
  for (int i = 0; i < count * kLetterBytes; i++) hash = (hash ^ g_bank[i]) * 16777619u;
  return hash;
}

static bool LetterGate(void) {
  return (enhanced_features2 & kFeatures2_ExtendedLetters) != 0;
}

static int LetterOf(uint8 a, const uint8 *src) {
  uint8 b = src[0];
  if ((g_zenv.dialogue_flags & 1) == 0)
    return (a >= kUsLetterFirst && a <= kUsLetterLast) ? (a - kUsLetterFirst) * kPage + b : -1;
  if (a == kEuName) return kEuNameFirst + b;
  if (a != kEuPrefix) return -1;
  if (b >= kEuLowFirst && b <= kEuLowLast) return b - kEuLowFirst;
  if (b >= kEuHighFirst) return kEuLowCount + b - kEuHighFirst;
  return -1;
}

static int SlotOf(int letter) {
  for (int slot = 0; slot < kGlyphSlots; slot++)
    if (g_slot_letter[slot] == letter + 1) return slot;
  return -1;
}

// The slot a new letter takes: an empty one first, else the one used longest ago that no cell on
// screen still shows. -1 when every free slot is on screen.
static int PickSlot(void) {
  int best = -1;
  int first = DialogFont_FirstFreeSlot();
  for (int slot = first > g_first_slot ? first : g_first_slot; slot < kGlyphSlots; slot++) {
    if (DialogFont_FixedSlot((uint8)slot) || DialogMirror_ShowsGlyph((uint8)slot)) continue;
    if (g_slot_letter[slot] == 0) return slot;
    if (best < 0 || g_slot_used[slot] < g_slot_used[best]) best = slot;
  }
  return best;
}

static int Assign(int letter) {
  if (DialogFont_Copy() == NULL) return -1;
  int slot = SlotOf(letter);
  if (slot >= 0) return slot;
  slot = PickSlot();
  if (slot < 0) return -1;
  const uint8 *entry = g_bank + letter * kLetterBytes;
  uint8 picture[1 + 2 * kTileBytes];
  picture[0] = entry[0];
  memcpy(picture + 1, entry + 2, 2 * kTileBytes);
  DialogFont_WriteGlyph((uint8)slot, picture);
  g_slot_letter[slot] = (uint16)(letter + 1);
  g_generation++;
  return slot;
}

static uint8 GlyphOf(int letter) {
  if (letter >= g_count) return kQuestionGlyph;
  uint8 fallback = g_bank[letter * kLetterBytes + 1];
  if (!LetterGate()) return fallback;
  int slot = Assign(letter);
  if (slot < 0) return fallback;
  g_slot_used[slot] = ++g_clock;
  return (uint8)slot;
}

uint32 DialogLetterBank_Decode(uint8 a, const uint8 *src) {
  int letter = LetterOf(a, src);
  if (letter < 0) return 0;
  return (uint32)GlyphOf(letter) << 6 | kCmdIsLetter << 1 | 1;
}

bool DialogLetterBank_Wanted(void) {
  return LetterGate() && g_count > 0;
}

void DialogLetterBank_Forget(void) {
  memset(g_slot_letter, 0, sizeof(g_slot_letter));
  memset(g_slot_used, 0, sizeof(g_slot_used));
  g_generation++;
}

EMSCRIPTEN_KEEPALIVE
uint8 *WasmLetterBankTable(void) {
  return g_bank;
}

// Take |count| letters from the table; no letter goes below |first_slot|, the first slot the host's
// text map leaves unused. Returns the letters taken, or 0 when refused (a count past the bank, or an
// entry whose width is not 1-8 or whose fallback is not a font glyph). Ungated, as the extra glyphs'
// load is: the bank only changes what an escape draws, and only while the gate is up. A bank that
// differs from the one loaded drops every slot's letter.
EMSCRIPTEN_KEEPALIVE
int WasmLoadLetterBank(int count, int first_slot) {
  if (count <= 0 || count > kMaxLetters || first_slot < 0) return 0;
  if (first_slot != g_first_slot) g_digest = 0;
  g_first_slot = first_slot;
  for (int i = 0; i < count; i++) {
    uint8 width = g_bank[i * kLetterBytes], fallback = g_bank[i * kLetterBytes + 1];
    if (width == 0 || width > 8 || fallback >= kGlyphSlots) return 0;
  }
  uint32 digest = Digest(count);
  if (count == g_count && digest == g_digest) return count;
  g_count = count;
  g_digest = digest;
  DialogLetterBank_Forget();
  return count;
}

// Session stop: no letters, every slot back to free.
EMSCRIPTEN_KEEPALIVE
void WasmClearLetterBank(void) {
  g_count = 0;
  g_digest = 0;
  DialogLetterBank_Forget();
}

// The letter each font slot holds plus one (0 for none), 128 u16s, for the host's own text map.
EMSCRIPTEN_KEEPALIVE
const uint16 *WasmLetterBankSlots(void) {
  return g_slot_letter;
}

// Changes whenever a slot's picture changes; the host keys its copy of the font on it.
EMSCRIPTEN_KEEPALIVE
uint32 WasmDialogFontGeneration(void) {
  return g_generation;
}
