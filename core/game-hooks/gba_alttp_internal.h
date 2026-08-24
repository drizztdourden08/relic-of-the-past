/* @layer core-game-hooks @kind native */
/**
 * Shared internals for the optional second-cartridge files.
 *
 * The supplement's assets and the room lookup are needed by every part of the feature — room
 * loading, graphics, palettes — so they live here rather than being duplicated per file.
 */
#ifndef ZELDA3_GBA_ALTTP_INTERNAL_H_
#define ZELDA3_GBA_ALTTP_INTERNAL_H_

#include "gba_alttp.h"
#include "src/zelda_rtl.h"

/** One asset of the supplement container, as a block. */
MemBlk GbaAlttpAsset(int index);

/** Index of a room within this dungeon's room list, or -1 when it is not one of ours. */
int GbaAlttpFindRoom(uint16 room);

#endif  // ZELDA3_GBA_ALTTP_INTERNAL_H_
