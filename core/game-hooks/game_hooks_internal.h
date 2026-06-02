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

// Forward-declare Link_ReceiveItem from player.c
extern void Link_ReceiveItem(uint8 item, int chest_position);

#endif // GAME_HOOKS_INTERNAL_H
