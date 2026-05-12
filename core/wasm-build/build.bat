@echo off
REM Build zelda3 as WebAssembly using Emscripten
REM Usage: build.bat
REM Prerequisites: Emscripten SDK must be activated (run emsdk_env.bat first)

setlocal enabledelayedexpansion

set ZELDA3=..\zelda3
set OUTPUT_DIR=output

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

set HOOK_SRCS=..\game-hooks\game_hooks.c

set EM_MAIN=emscripten_main.c

echo ============================================
echo Building zelda3 WASM...
echo ============================================

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
  -sALLOW_MEMORY_GROWTH=1 ^
  -sINITIAL_MEMORY=67108864 ^
  -sFORCE_FILESYSTEM=1 ^
  -sMODULARIZE=1 ^
  -sEXPORT_NAME="Zelda3" ^
  -sEXPORTED_FUNCTIONS="['_main','_WasmSaveState','_WasmLoadState','_WasmSaveSram','_WasmLoadSram','_WasmSetItemOverride','_WasmClearItemOverrides','_WasmSetFeatures','_WasmGetFeatures','_WasmSetPpuRenderFlags','_WasmGetPpuRenderFlags','_WasmGetFps','_WasmSetDisplayPerf','_WasmGetInventoryState','_WasmGetRoomFlags','_WasmGetLiveRoomFlags','_WasmGetOverworldFlags','_WasmGetProgressFlags','_WasmSetInput','_WasmSetInputMode','_WasmTriggerCheck','_WasmTriggerNpcCheck']" ^
  -sEXPORTED_RUNTIME_METHODS="['ccall','cwrap','FS','HEAPU8']" ^
  -sASYNCIFY

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
echo         %OUTPUT_DIR%\zelda3.data
echo ============================================
