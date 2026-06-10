/* @layer core-game-hooks @kind native */
#ifndef WASM_BUF_H
#define WASM_BUF_H

#include "src/types.h"

// ─── Little-endian output-buffer helpers for state-query exports ───
//
// Every Wasm*Get* query packs a fixed binary layout into a static buffer and
// returns its address as int; the TS bridge parses the same layout. These
// helpers centralize the byte-packing that used to be hand-rolled in every
// query (`buf[o] = v & 0xFF; buf[o+1] = (v >> 8) & 0xFF;` repeated hundreds of
// times), so the C side and the TS parser stay in lockstep on field width and
// offset arithmetic stops being a copy-paste hazard.
//
// Two access styles:
//   • PutU16 — random access at a known offset (fixed-layout structs like the
//     UI-state and viewport buffers).
//   • BufW   — a sequential append cursor (count-prefixed list builders, where
//     the per-entry offset `2 + i * stride` was previously open-coded).

// Random-access little-endian uint16 store.
static inline void PutU16(uint8 *buf, int at, uint16 v) {
  buf[at + 0] = (uint8)(v & 0xFF);
  buf[at + 1] = (uint8)((v >> 8) & 0xFF);
}

// Append cursor over a caller-owned buffer.
typedef struct {
  uint8 *p;
  int at;
} BufW;

static inline BufW BufW_Init(uint8 *buf) {
  BufW b = { buf, 0 };
  return b;
}

static inline void BufW_U8(BufW *b, uint8 v) {
  b->p[b->at++] = v;
}

static inline void BufW_U16(BufW *b, uint16 v) {
  b->p[b->at++] = (uint8)(v & 0xFF);
  b->p[b->at++] = (uint8)((v >> 8) & 0xFF);
}

#endif // WASM_BUF_H
