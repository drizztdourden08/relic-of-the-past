/* @layer core-game-hooks @kind native */
#ifndef GAME_HOOKS_INTERNAL_H
#define GAME_HOOKS_INTERNAL_H

#include "game_hooks.h"
#include <stdio.h>
#include <string.h>
#include <emscripten.h>
#include "src/variables.h"
#include "src/assets.h"
#include "src/zelda_rtl.h"
#include "src/config.h"
#include "src/hud.h"
#include "src/overworld.h"
#include "src/dungeon.h"
#include "src/misc.h"
#include "src/messaging.h"
#include "snes/ppu.h"

#include "game_constants.h"
#include "num_util.h"
#include "wasm_buf.h"
#include "host_gates.h"

// Forward-declare Link_ReceiveItem from player.c
extern void Link_ReceiveItem(uint8 item, int chest_position);

// The shared sprite-side receipt draw (receipt_sprite_draw.c): sprite |k| drawn as the
// receipt art of grant id |grant| (a virtual id as its presentation item), offset
// |x_adj|/|y_adj| pixels from its own draw origin. False when |grant| is -1 or its art
// cannot be substituted this frame — the caller keeps vanilla art.
bool GameHook_DrawSpriteAsReceiptItem(int k, int grant, int x_adj, int y_adj);
// True while a hold-up receipt lives: the decode slot is the held-up item's, and a shop
// spot ignores a press until the ceremony is over.
bool GameHook_HoldUpReceiptLive(void);
// The memo of |k|'s picture: kept from the decode slot once the caller has committed this
// frame's finished picture for |grant|, and drawn back, without any decode, for the frames
// the hold-up owns the slot. The draw is false when no memo of |grant| stands for |k|.
void GameHook_MemoSpriteArt(int k, int grant);
bool GameHook_DrawSpriteArtFromMemo(int k, int grant, int x_adj, int y_adj);

// The armed contextual one-shot, consumed, for a seam that shows the line itself
// (receipt_messages.c); -1 when the gate is down, nothing is armed, or the blob lacks it.
int GameHook_TakeReceiptMessage(void);

// Coloured rupees (rupee_gem_draw.c). True when grant id |grant| is a rupee reward and the
// gate is on: |*item| becomes the numberless gem's receipt (its art and 8x16 shape) and
// |*pal| the palette row that gives this denomination its colour. GameHook_TintRupeeGem is
// the sprite-side finish over the freshly decoded slot: the world rupee's current shine
// picture in place of the resting one, then the gem's two colour indices pointed at that
// row's pair, for the denominations no row states outright. GameHook_RecolorRupeeGem is
// the recolour alone, for a draw that cycles its own pictures (the hold-up) or shows one
// still (the pond volley). GameHook_IsRupeeReceipt answers regardless of the gate.
bool GameHook_ColoredRupeeGem(int grant, uint8 *item, uint8 *pal);
void GameHook_TintRupeeGem(int grant);
void GameHook_RecolorRupeeGem(int grant);
bool GameHook_IsRupeeReceipt(int grant);

// Item sheen (item_sheen.c). The draw helper arms the glint for the row it settled on
// (|skip| for a picture that carries its own highlight); each world draw seam applies it
// once anything else that repaints the decode slot — the capacity icon — has run.
// GameHook_PaintItemSheen is the sweep itself, this frame's diagonal in |pal_row|'s
// lightest colour over the slot, for a caller that keeps its own picture (the hold-up,
// item_sheen_holdup.c). GameHook_ItemSheenHoldUpFrameEnd is that caller's frame end.
void GameHook_ArmItemSheen(uint8 pal_row, bool skip);
void GameHook_ApplyItemSheen(void);
void GameHook_PaintItemSheen(uint8 pal_row);
void GameHook_ItemSheenHoldUpFrameEnd(void);

// True when the loaded dialogue blob actually carries line |msg|. An asset blob compiled before the
// randomizer template lines were appended stops at the canonical vanilla count, and showing an index
// past its end would open an empty box. FindIndexInMemblk answers {0,0} for an out-of-range index,
// which makes the test safe against any blob vintage. Every seam that substitutes a template line
// asks this first and falls back to the line the vendored code chose.
static inline bool DialogueLineExists(int msg) {
  MemBlk dialogue = FindIndexInMemblk(g_zenv.dialogue_blk, 1);
  return FindIndexInMemblk(dialogue, (size_t)msg).ptr != NULL;
}

// True when the master cheat switch (kFeatures3_CheatsEnabled) AND |bit| are both set in features3.
// Every WasmCheat* export and cheat accessor tests this instead of a bare enhanced_features3 check, so
// turning cheats off silences every category in one place and a call site never needs "A && B".
static inline bool CheatGate(uint32 bit) {
  return (enhanced_features3 & kFeatures3_CheatsEnabled) != 0 && (enhanced_features3 & bit) != 0;
}

// The simulator's read side: developer mode alone. The Location & Navigation widget inspects sim
// state (chests, doors, sprite spawns, cell locks) outside of a run as well as during one, so this
// cannot also require kHostGate_SimulatorSupport — that bit is armed only for the run's lifetime.
static inline bool SimQueryGate(void) {
  return (enhanced_features0 & kFeatures0_DeveloperTools) != 0;
}

// The simulator's write side: developer mode AND the run-scoped host gate. Dev mode is the standing
// permission (matches every other dev-only surface); the host gate additionally confines mutation to
// an actual armed run, so merely toggling dev mode on in a live session can't move doors or kill
// enemies underfoot.
static inline bool SimMutateGate(void) {
  return SimQueryGate() && HostGate(kHostGate_SimulatorSupport);
}

// Check-trigger grants answer to THREE callers holding different permissions: the cheat UI, the
// simulator walking a route headlessly, and the randomizer delivery queue completing a scripted
// check. On the cheat bit alone a sim run silently produced wrong results whenever cheats were off —
// grants no-opped while the run still reported success — and a cheatless delivery session lost its
// scripted-giver checks the same way (notification shown, nothing granted). Resolved once here so
// each call site stays a single condition. The simulator half is SimMutateGate rather than a bare
// HostGate check so a check-trigger grant answers to the same dev-mode + run-scope requirement as
// every other WasmSim* mutator. The delivery half is kFeatures3_ReceiptExport: a session (local or
// online) arms it at start and disarms it at stop (receipt-grants.ts), it needs no cheat bit, and
// the parity mask (zelda_rtl.c) strips it un-bypassably under Vanilla Safe — the same authority
// WasmGrantItemWithReceipt already answers to. A refusal names itself so a mis-armed session shows
// up in the log instead of silently dropping the grant.
static inline bool TriggerGrantAllowed(void) {
  if (CheatGate(kFeatures3_CheatItemGrant) || SimMutateGate()) return true;
  if ((enhanced_features3 & kFeatures3_ReceiptExport) != 0) return true;
  printf("[GameHook] Check trigger refused: no cheat item-grant, sim run, or delivery session armed\n");
  return false;
}

// The virtual receive ids (upgrade_grants.c, progressive_grants.c) own no gate of their own: they
// are reachable only from inside the already-gated substitution/receipt seams. Their resolvers still
// refuse any side effect unless at least one of those seams is open, so a stray call with every gate
// down leaves the save bytes untouched.
static inline bool GrantSeamOpen(void) {
  return (enhanced_features3 & (kFeatures3_ItemOverrides | kFeatures3_NpcOverrides |
                                kFeatures3_DropOverrides | kFeatures3_StandingOverrides |
                                kFeatures3_ReceiptExport | kFeatures3_ScriptedGrants)) != 0;
}

// ─── Host-data gates ───
// Exports that feed a HOST system rather than the game. None of them changes what the game computes,
// but "it only reads" is not a reason to skip a gate: each is a host feature consuming emulated state,
// so each answers to its own bit. Keeping them separate is what makes the granularity real — turning
// the tracker off must not take navigation down with it.
//
// Every one of these is a plain single-bit test, so a call site stays one condition. Where a query
// genuinely serves two systems the OR lives HERE, in a named helper, never at the call site.

static inline bool TrackerQueryGate(void) {
  return (enhanced_features3 & kFeatures3_TrackerQueries) != 0;
}

static inline bool NavQueryGate(void) {
  return (enhanced_features3 & kFeatures3_NavigationQueries) != 0;
}

static inline bool RenderQueryGate(void) {
  return (enhanced_features3 & kFeatures3_RenderQueries) != 0;
}

static inline bool OverlayQueryGate(void) {
  return (enhanced_features3 & kFeatures3_OverlayQueries) != 0;
}

static inline bool DeliveryQueryGate(void) {
  return (enhanced_features3 & kFeatures3_DeliveryQueries) != 0;
}

// The save-flag reads (progress, room, overworld) genuinely serve two masters: the tracker polls them
// for the player's checklist, and the simulator reads them while walking a route. Gating them on the
// simulator's half alone would silently kill the tracker for every player, which is the trap this
// helper exists to make impossible to fall into at a call site.
static inline bool FlagQueryGate(void) {
  return TrackerQueryGate() || NavQueryGate() || SimQueryGate();
}

#endif // GAME_HOOKS_INTERNAL_H
