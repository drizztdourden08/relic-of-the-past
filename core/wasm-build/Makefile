# @layer core-wasm-build @kind build
# Emscripten WASM build for zelda3 — thin wrapper.
#
# The source list and emcc flags live in build.mjs, the single source of truth
# shared by this Makefile, build.bat, ensure-wasm, and CI. Keeping the build in
# one place means it can never drift between platforms.
#
# Prerequisite: the Emscripten SDK is activated (emcc on PATH).
# Usage:  make        (emcc already resolves; emmake is not required)
# Output: apps/web/public/wasm/zelda3.{js,wasm}

.PHONY: all clean

all:
	node build.mjs

clean:
	rm -rf ../../apps/web/public/wasm/zelda3.js ../../apps/web/public/wasm/zelda3.wasm
