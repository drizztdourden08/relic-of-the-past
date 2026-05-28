# Emscripten WASM Build for zelda3
#
# Prerequisites:
#   - Emscripten SDK installed and activated
#   - On Windows: run from cmd.exe with emsdk_env.bat sourced
#     cmd /c "E:\GameProjects\emsdk\emsdk_env.bat && cd /d E:\GameProjects\alttp_port\core\wasm-build && emmake make"
#
# Usage:
#   cd core/wasm-build
#   emmake make
#
# Output: output/zelda3.js, output/zelda3.wasm, output/zelda3.data

ZELDA3 := ../zelda3

# Source files — game logic + SNES emulation + Opus decoder
# Excludes: main.c (replaced by emscripten_main.c), opengl.c, glsl_shader.c,
#           gl_core_3_1.c, volume_control.c (Win32-only)
GAME_SRCS := \
	$(ZELDA3)/src/ancilla.c \
	$(ZELDA3)/src/attract.c \
	$(ZELDA3)/src/audio.c \
	$(ZELDA3)/src/config.c \
	$(ZELDA3)/src/dungeon.c \
	$(ZELDA3)/src/ending.c \
	$(ZELDA3)/src/hud.c \
	$(ZELDA3)/src/load_gfx.c \
	$(ZELDA3)/src/messaging.c \
	$(ZELDA3)/src/misc.c \
	$(ZELDA3)/src/nmi.c \
	$(ZELDA3)/src/overlord.c \
	$(ZELDA3)/src/overworld.c \
	$(ZELDA3)/src/player.c \
	$(ZELDA3)/src/player_oam.c \
	$(ZELDA3)/src/poly.c \
	$(ZELDA3)/src/select_file.c \
	$(ZELDA3)/src/spc_player.c \
	$(ZELDA3)/src/sprite.c \
	$(ZELDA3)/src/sprite_main.c \
	$(ZELDA3)/src/tagalong.c \
	$(ZELDA3)/src/tile_detect.c \
	$(ZELDA3)/src/util.c \
	$(ZELDA3)/src/zelda_cpu_infra.c \
	$(ZELDA3)/src/zelda_rtl.c

SNES_SRCS := \
	$(ZELDA3)/snes/apu.c \
	$(ZELDA3)/snes/cart.c \
	$(ZELDA3)/snes/cpu.c \
	$(ZELDA3)/snes/dma.c \
	$(ZELDA3)/snes/dsp.c \
	$(ZELDA3)/snes/input.c \
	$(ZELDA3)/snes/ppu.c \
	$(ZELDA3)/snes/snes.c \
	$(ZELDA3)/snes/snes_other.c \
	$(ZELDA3)/snes/spc.c \
	$(ZELDA3)/snes/tracing.c

OPUS_SRC := $(ZELDA3)/third_party/opus-1.3.1-stripped/opus_decoder_amalgam.c

# Game hooks
HOOK_SRCS := ../game-hooks/game_hooks.c \
             ../game-hooks/item_overrides.c \
             ../game-hooks/state_queries.c \
             ../game-hooks/check_triggers.c \
             ../game-hooks/ui_state.c \
             ../game-hooks/cheats.c \
             ../game-hooks/haptic_events.c

# Our Emscripten-specific main
EM_MAIN := emscripten_main.c

ALL_SRCS := $(EM_MAIN) $(GAME_SRCS) $(SNES_SRCS) $(OPUS_SRC) $(HOOK_SRCS)

OUTPUT_DIR := output
TARGET := $(OUTPUT_DIR)/zelda3.js

CC := emcc

CFLAGS := -O2 \
	-I $(ZELDA3) \
	-I ../game-hooks \
	-DSYSTEM_VOLUME_MIXER_AVAILABLE=0 \
	-Wno-unused-function \
	-Wno-unused-variable

EMFLAGS := -sUSE_SDL=2 \
	-sWASM=1 \
	-sALLOW_MEMORY_GROWTH=1 \
	-sINITIAL_MEMORY=67108864 \
	-sFORCE_FILESYSTEM=1 \
	-sMODULARIZE=1 \
	-sEXPORT_NAME='Zelda3' \
	-sENVIRONMENT=web,node \
	-sEXPORTED_FUNCTIONS='["_main","_WasmSaveState","_WasmLoadState","_WasmSaveSram","_WasmLoadSram","_WasmSetItemOverride","_WasmClearItemOverrides","_WasmSetFeatures","_WasmGetFeatures","_WasmSetPpuRenderFlags","_WasmGetPpuRenderFlags","_WasmGetFps","_WasmSetDisplayPerf","_WasmGetInventoryState","_WasmGetRoomFlags","_WasmGetLiveRoomFlags","_WasmGetOverworldFlags","_WasmGetProgressFlags","_WasmSetInput","_WasmSetInputMode","_WasmTriggerCheck","_WasmTriggerNpcCheck","_WasmSetPaused","_WasmGetPaused","_WasmTogglePause","_WasmReset","_WasmCheat","_WasmGetViewportInfo","_WasmGetIndoorAttrTable","_WasmGetLinkIsOnLowerLevel","_WasmGetIndoorUncleBlockers","_WasmGetNavigationBlockers","_WasmGetLiveSprites","_WasmGetOverworldGuardSpawns","_WasmRenderCleanFrame","_WasmGetCleanFrameWidth","_WasmGetCleanFrameHeight","_WasmGetGameUIState","_WasmSetUIOverlayMode","_WasmGetUIOverlayMode","_WasmSetMusicVolume","_WasmSetSfxVolume","_WasmCheatGiveItem","_WasmCheatSetHealth","_WasmCheatSetMaxHealth","_WasmCheatSetRupees","_WasmCheatSetBombs","_WasmCheatSetArrows","_WasmCheatRefillMagic","_WasmCheatFillBottle","_WasmCheatKillAllEnemies","_WasmCheatSetDamageMultiplier","_WasmCheatSetExtraArmorPct","_WasmBuildOverworldAttrGrid","_WasmBuildRoomAttrGrid","_WasmInitHeadless","_WasmGetRoomLayoutInfo","_WasmGetRoomDoorBoundaryTiles"]' \
-sEXPORTED_RUNTIME_METHODS='["ccall","cwrap","FS","HEAPU8"]'

LDFLAGS := $(EMFLAGS)

.PHONY: all clean dirs

all: dirs $(TARGET)

$(TARGET): $(ALL_SRCS)
	$(CC) $(CFLAGS) $(ALL_SRCS) -o $(TARGET) $(LDFLAGS)

dirs:
	@mkdir -p $(OUTPUT_DIR)
	@mkdir -p assets

clean:
	rm -rf $(OUTPUT_DIR)
