REM @layer core-wasm-build @kind build
@echo off
REM Build zelda3 as WebAssembly using Emscripten.
REM Usage: build.bat   (prerequisite: emsdk_env.bat sourced so emcc is on PATH)
REM
REM This is a thin wrapper. The source list and emcc flags live in build.mjs,
REM the single source of truth shared by this script, the Makefile, ensure-wasm,
REM and CI — so the build can never drift between platforms.

node "%~dp0build.mjs"
exit /b %ERRORLEVEL%
