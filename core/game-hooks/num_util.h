/* @layer core-game-hooks @kind native */
#ifndef NUM_UTIL_H
#define NUM_UTIL_H

// ─── Small numeric helpers shared across the hook + wasm-build layers ───
// Reachable from both core/game-hooks and core/wasm-build (the build adds
// `-I ../game-hooks`), so the clamp logic that the cheat setters and the
// volume setters both need is defined exactly once.

// Clamp an int into the inclusive range [lo, hi]. Replaces the nested-ternary
// `v > hi ? hi : (v < lo ? lo : v)` clamps that were copy-pasted per setter.
static inline int clampi(int v, int lo, int hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}

#endif // NUM_UTIL_H
