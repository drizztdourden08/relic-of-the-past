REM @layer core-wasm-build @kind build
@echo off
REM Build zelda3 as WebAssembly using Emscripten
REM Usage: build.bat
REM Prerequisites: Emscripten SDK must be activated (run emsdk_env.bat first)

setlocal enabledelayedexpansion

set ZELDA3=..\zelda3
REM Renderer public dir (electron.vite.config publicDir + scripts/ensure-wasm.mjs); also the web/mobile build root.
set OUTPUT_DIR=..\..\apps\web\public\wasm

if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"
if not exist "assets" mkdir "assets"

set GAME_SRCS=^
 %ZELDA3%\src\ancilla.c^
 %ZELDA3%\src\attract.c^
 %ZELDA3%\src\audio.c^
 %ZELDA3%\src\config.c^
 %ZELDA3%\src\dungeon.c^
 %ZELDA3%\src\ending.c^
 %ZELDA3%\src\hud.c^
 %ZELDA3%\src\load_gfx.c^
 %ZELDA3%\src\messaging.c^
 %ZELDA3%\src\misc.c^
 %ZELDA3%\src\nmi.c^
 %ZELDA3%\src\overlord.c^
 %ZELDA3%\src\overworld.c^
 %ZELDA3%\src\player.c^
 %ZELDA3%\src\player_oam.c^
 %ZELDA3%\src\poly.c^
 %ZELDA3%\src\select_file.c^
 %ZELDA3%\src\spc_player.c^
 %ZELDA3%\src\sprite.c^
 %ZELDA3%\src\sprite_main.c^
 %ZELDA3%\src\tagalong.c^
 %ZELDA3%\src\tile_detect.c^
 %ZELDA3%\src\util.c^
 %ZELDA3%\src\zelda_cpu_infra.c^
 %ZELDA3%\src\zelda_rtl.c

set SNES_SRCS=^
 %ZELDA3%\snes\apu.c^
 %ZELDA3%\snes\cart.c^
 %ZELDA3%\snes\cpu.c^
 %ZELDA3%\snes\dma.c^
 %ZELDA3%\snes\dsp.c^
 %ZELDA3%\snes\input.c^
 %ZELDA3%\snes\ppu.c^
 %ZELDA3%\snes\snes.c^
 %ZELDA3%\snes\snes_other.c^
 %ZELDA3%\snes\spc.c^
 %ZELDA3%\snes\tracing.c

set OPUS_SRC=%ZELDA3%\third_party\opus-1.3.1-stripped\opus_decoder_amalgam.c

set HOOK_SRCS=^
 ..\game-hooks\game_hooks.c^
 ..\game-hooks\state_queries.c^
 ..\game-hooks\state_queries_sprites.c^
 ..\game-hooks\state_queries_grids.c^
 ..\game-hooks\state_queries_tables.c^
 ..\game-hooks\state_queries_rooms.c^
 ..\game-hooks\state_queries_room_exits.c^
 ..\game-hooks\item_overrides.c^
 ..\game-hooks\check_triggers.c^
 ..\game-hooks\ui_state.c^
 ..\game-hooks\cheats.c^
 ..\game-hooks\haptic_events.c

set EM_MAIN=emscripten_main.c emscripten_sdl.c emscripten_api.c emscripten_io.c

echo ============================================
echo Building zelda3 WASM...
echo ============================================

REM NOTE: We do NOT maintain an explicit EXPORTED_FUNCTIONS list of Wasm* exports.
REM Every JS-callable function is tagged EMSCRIPTEN_KEEPALIVE in its .c file, which
REM both retains and exports the symbol. KEEPALIVE is the single source of truth, so
REM adding a new export only touches the C file + the ccall site (no build edits).
REM Only the runtime entry points that JS may call directly are listed below.

emcc -O2 -g2 ^
  -I %ZELDA3% ^
  -I ..\game-hooks ^
  -DSYSTEM_VOLUME_MIXER_AVAILABLE=0 ^
  -Wno-unused-function ^
  -Wno-unused-variable ^
  %EM_MAIN% ^
  %GAME_SRCS% ^
  %SNES_SRCS% ^
  %OPUS_SRC% ^
  %HOOK_SRCS% ^
  -o %OUTPUT_DIR%\zelda3.js ^
  -sUSE_SDL=2 ^
  -sWASM=1 ^
  -sSTACK_SIZE=4194304 ^
  -sALLOW_MEMORY_GROWTH=1 ^
  -sINITIAL_MEMORY=67108864 ^
  -sFORCE_FILESYSTEM=1 ^
  -sMODULARIZE=1 ^
  -sEXPORT_NAME="Zelda3" ^
  -sEXPORTED_FUNCTIONS="['_main','_malloc','_free']" ^
  -sEXPORTED_RUNTIME_METHODS="['ccall','cwrap','FS','HEAPU8']"

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo BUILD FAILED
  exit /b 1
)

echo.
echo ============================================
echo Build successful!
echo Output: %OUTPUT_DIR%\zelda3.js
echo         %OUTPUT_DIR%\zelda3.wasm
echo ============================================
