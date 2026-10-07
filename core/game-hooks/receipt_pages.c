/* @layer core-game-hooks @kind native */
// Paged receipts: a receipt whose grant has a detail line of its own (a capacity climb's
// numbers) shows the line armed for the receipt first and the detail as its next page. The
// detail is only known once the grant resolves, and the line before it (the found line, the
// incoming line of a shared game, a class or native line) is already armed by then, so the
// resolver chains the two here instead of replacing one with the other
// (GameHook_ArmReceiptDetailPage, receipt_messages.c). The receipt shows the first line; when
// the engine loads it, the detail's bytes are appended to the loaded buffer.
//
// The detail line is composed by the host as a page already (page-message.ts): a key wait,
// then each row scrolled in, the way the game's own long lines move on to their next box. So
// this file joins bytes and never lays anything out for it.
//
// A shelf selling another player's item (ReceiptPages_ChainAsPage, shop_refusal.c) chains the
// shop's thanks and an ordinary line, so that line is laid out as a page while it is appended,
// in the shape page-message.ts composes. When it does not fit, it replaces the thanks: the
// player is always told where the item went.
//
// Gate: kFeatures3_ReceiptMessages. Gate off, nothing is ever chained (the arm is gated) and
// the load hook returns before touching the buffer, so the loaded text is the vendored one.
// State is hook statics, never WRAM; the joined text itself lives in the WRAM text buffer
// like any loaded message.
#include "game_hooks_internal.h"

// The loaded buffer is at most this long (Text_Initialize_initModuleStateLoop clears 0x7e0 bytes).
enum { kTextBufferBytes = 0x7e0 };
// The end-of-message byte, the same in both encodings (messaging.c Text_LoadCharacterBuffer).
enum { kEndMessageByte = 0x7f };
// Bytes from here up spell a dictionary word (messaging.c kTextDictBase).
enum { kDictBase = 0x88 };
// The engine's kTextCmd_* values this file reads or writes (messaging.c, local to the vendored
// file).
enum {
  kCmd_Scroll = 12,
  kCmd_Line1 = 13,
  kCmd_Line2 = 14,
  kCmd_Line3 = 15,
  kCmd_Waitkey = 23,
  kCmd_EndMessage = 24,
};
// Where the US encoding's commands start (messaging.c kTextCommandStart_US), and the EU
// encoding's scroll and key-wait bytes (messaging.c kTextCmd_EU_*).
enum { kUsCommandStart = 0x67, kEuScrollByte = 0x80, kEuWaitkeyByte = 0x81 };
// Rows the box shows at once: a page scrolls this many rows in before it stops.
enum { kVisibleRows = 3 };

// The engine's command decoder (messaging.c, not in its header).
uint32 Text_DecodeCmd(uint8 a, const uint8 *src);

// The line the receipt shows, and the detail page that follows it; -1 when nothing is chained.
static int g_head_msg = -1;
static int g_detail_msg = -1;
// True when the detail is an ordinary line to be laid out as a page while it is appended.
static bool g_detail_as_page = false;

static uint8 CmdOf(uint32 packed) { return (packed >> 1) & 0x1f; }
static int LengthOf(uint32 packed) { return 1 + (int)(packed & 1); }

void ReceiptPages_Chain(int head_msg, int detail_msg) {
  g_head_msg = head_msg;
  g_detail_msg = detail_msg;
  g_detail_as_page = false;
}

void ReceiptPages_ChainAsPage(int head_msg, int detail_msg) {
  ReceiptPages_Chain(head_msg, detail_msg);
  g_detail_as_page = true;
}

void ReceiptPages_Clear(void) {
  g_head_msg = -1;
  g_detail_msg = -1;
  g_detail_as_page = false;
}

// The byte that spells a scroll or a key wait in the loaded blob's encoding.
static uint8 CommandByte(uint8 cmd) {
  if ((g_zenv.dialogue_flags & 1) == 0) return (uint8)(kUsCommandStart + cmd);
  return cmd == kCmd_Scroll ? kEuScrollByte : kEuWaitkeyByte;
}

// Where the loaded message ends: the offset of its end byte, or -1 when none is found.
static int LoadedEnd(void) {
  const uint8 *buf = messaging_text_buffer;
  for (int pos = 0; pos < kTextBufferBytes;) {
    uint32 packed = Text_DecodeCmd(buf[pos], &buf[pos + 1]);
    if (CmdOf(packed) == kCmd_EndMessage) return pos;
    pos += LengthOf(packed);
  }
  return -1;
}

// Spells line |msg| out at |dst| (at most |room| bytes), dictionary words expanded as the loader
// expands them. The bytes written, or -1 when the line is missing or does not fit.
static int SpellLine(int msg, uint8 *dst, int room) {
  MemBlk dictionary = FindIndexInMemblk(g_zenv.dialogue_blk, 0);
  MemBlk dialogue = FindIndexInMemblk(g_zenv.dialogue_blk, 1);
  MemBlk line = FindIndexInMemblk(dialogue, (size_t)msg);
  if (line.ptr == NULL) return -1;
  int n = 0;
  for (size_t i = 0; i < line.size;) {
    uint8 c = line.ptr[i];
    if (c >= kDictBase) {
      MemBlk word = FindIndexInMemblk(dictionary, c - kDictBase);
      if (n + (int)word.size > room) return -1;
      memcpy(dst + n, word.ptr, word.size);
      n += (int)word.size;
      i++;
      continue;
    }
    uint32 packed = Text_DecodeCmd(c, i + 1 < line.size ? &line.ptr[i + 1] : &line.ptr[i]);
    if (CmdOf(packed) == kCmd_EndMessage) break;
    int len = LengthOf(packed);
    if (n + len > room || i + len > line.size) return -1;
    memcpy(dst + n, &line.ptr[i], len);
    n += len;
    i += len;
  }
  return n;
}

// Spells ordinary line |msg| out at |dst| (at most |room| bytes) as a page: a key wait, each row
// scrolled in (the row commands become scrolls), and empty scrolls up to a full box. The bytes
// written, or -1 when the line is missing or the page does not fit.
static int SpellAsPage(int msg, uint8 *dst, int room) {
  static uint8 line[kTextBufferBytes];
  int len = SpellLine(msg, line, kTextBufferBytes - 1);
  if (len < 0 || room < 2) return -1;
  line[len] = kEndMessageByte;
  uint8 scroll = CommandByte(kCmd_Scroll);
  int n = 0, rows = 1;
  dst[n++] = CommandByte(kCmd_Waitkey);
  dst[n++] = scroll;
  for (int i = 0; i < len;) {
    uint32 packed = Text_DecodeCmd(line[i], &line[i + 1]);
    uint8 cmd = CmdOf(packed);
    int step = LengthOf(packed);
    bool row_break = cmd == kCmd_Line2 || cmd == kCmd_Line3;
    if (row_break) {
      if (n + 1 > room) return -1;
      dst[n++] = scroll;
      rows++;
    } else if (cmd != kCmd_Line1) {
      if (n + step > room) return -1;
      memcpy(dst + n, &line[i], step);
      n += step;
      if (cmd == kCmd_Scroll) rows++;
    }
    i += step;
  }
  for (; rows < kVisibleRows; rows++) {
    if (n + 1 > room) return -1;
    dst[n++] = scroll;
  }
  return n;
}

// The detail line did not fit behind the head (whose end byte is at |end|), so it is the whole
// message instead. Spelled aside first, so a line that cannot be spelled leaves the head intact.
static void ShowDetailAlone(int head, int detail, int end) {
  static uint8 alone[kTextBufferBytes];
  int written = SpellLine(detail, alone, kTextBufferBytes - 1);
  if (written < 0) {
    messaging_text_buffer[end] = kEndMessageByte;
    printf("[Randomizer] Receipt page %d missing, %d only\n", detail, head);
    return;
  }
  memcpy(messaging_text_buffer, alone, written);
  messaging_text_buffer[written] = kEndMessageByte;
  printf("[Randomizer] Receipt page %d does not fit behind %d, shown alone\n", detail, head);
}

// The engine just loaded a message (GameHook_DialogCleared runs right after the loader). The
// chained receipt gets its detail page appended; any other message drops the chain.
void ReceiptPages_MessageLoaded(void) {
  if (g_detail_msg < 0) return;
  int head = g_head_msg, detail = g_detail_msg;
  bool as_page = g_detail_as_page;
  ReceiptPages_Clear();
  if (!(enhanced_features3 & kFeatures3_ReceiptMessages) || dialogue_message_index != head) return;
  int end = LoadedEnd();
  if (end < 0) return;
  // One byte stays free for the end byte.
  uint8 *dst = messaging_text_buffer + end;
  int room = kTextBufferBytes - end - 1;
  int written = as_page ? SpellAsPage(detail, dst, room) : SpellLine(detail, dst, room);
  if (written < 0 && as_page) {
    ShowDetailAlone(head, detail, end);
    return;
  }
  if (written < 0) {
    printf("[Randomizer] Receipt page %d does not fit behind %d, first page only\n", detail, head);
    messaging_text_buffer[end] = kEndMessageByte;
    return;
  }
  messaging_text_buffer[end + written] = kEndMessageByte;
  printf("[Randomizer] Receipt message %d shows %d as its next page\n", head, detail);
}
