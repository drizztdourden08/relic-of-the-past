/* @layer core-wasm-build @kind build */
/**
 * Computes this build's save state layout identity.
 *
 * The snapshot inside a .sav is written as an ordered walk of fixed-size regions.
 * Passing a counting callback through that same walk records the SEQUENCE of region
 * lengths, which is the thing that actually decides whether one build can read
 * another's save states. A sequence and not a sum, so reordering two regions of
 * equal size still changes the answer.
 *
 * The callback records lengths and never dereferences the data pointer, so the walk
 * runs against zeroed dummy structs. That is what lets this run on a machine with no
 * ROM, no assets and no booted game, such as a release runner.
 *
 * Built and run by layout-probe.mjs, which turns the printed sequence into the
 * generated format id. Not part of the app build.
 */
#include <stdio.h>
#include <stdint.h>
#include <stddef.h>

#include "snes/dsp.h"
#include "snes/dma.h"
#include "snes/ppu.h"

#define MAX_REGIONS 128

typedef struct {
  int count;
  int overflowed;
  uint32_t sizes[MAX_REGIONS];
} LayoutWalk;

static void CountRegion(void *ctx, void *data, size_t size) {
  LayoutWalk *walk = (LayoutWalk *)ctx;
  (void)data; /* deliberately unread, as the file comment explains */
  if (walk->count >= MAX_REGIONS) {
    walk->overflowed = 1;
    return;
  }
  walk->sizes[walk->count++] = (uint32_t)size;
}

/* Static and not local: the snapshot structs are hundreds of kilobytes between
   them, which is more than the probe's stack should be asked to hold. */
static Dsp probe_dsp;
static Dma probe_dma;
static Ppu probe_ppu;

/**
 * Mirrors the region walk the core performs when it writes a snapshot.
 *
 * The three region functions are called for real, because they are where the layout
 * actually moves: dsp_saveload spans `sizeof(Dsp) - offsetof(Dsp, ram)`, and the ppu
 * and dma walks are equally derived from their struct definitions.
 *
 * The plain literals around them are copied from InternalSaveLoad, which is static to
 * its translation unit in the vendored core and so cannot be called from here. Those
 * constants are the residual gap: a change to one of them would not move this id on its
 * own. The renderer's own check covers it, comparing this build's declared total against
 * the byte count the core really writes the first time anything is saved.
 */
static void WalkSnapshotRegions(LayoutWalk *walk) {
  CountRegion(walk, NULL, 27);      /* leading padding */
  CountRegion(walk, NULL, 0x10000); /* audio processor ram */
  CountRegion(walk, NULL, 40);      /* padding */
  dsp_saveload(&probe_dsp, &CountRegion, walk);
  CountRegion(walk, NULL, 15);      /* padding */
  dma_saveload(&probe_dma, &CountRegion, walk);
  ppu_saveload(&probe_ppu, &CountRegion, walk);
  CountRegion(walk, NULL, 0x2000);  /* battery-backed ram */
  CountRegion(walk, NULL, 58);      /* padding */
  CountRegion(walk, NULL, 0x20000); /* work ram */
  CountRegion(walk, NULL, 4);       /* trailing padding */
}

int main(void) {
  LayoutWalk walk = { 0 };
  uint64_t total = 0;

  WalkSnapshotRegions(&walk);

  if (walk.overflowed) {
    fprintf(stderr, "state-layout-probe: more than %d regions, raise MAX_REGIONS\n", MAX_REGIONS);
    return 1;
  }

  /* One line, comma separated, then the total. layout-probe.mjs parses exactly this. */
  for (int i = 0; i < walk.count; i++) {
    total += walk.sizes[i];
    printf("%s%u", i ? "," : "", walk.sizes[i]);
  }
  printf("\ntotal=%llu\n", (unsigned long long)total);
  return 0;
}
