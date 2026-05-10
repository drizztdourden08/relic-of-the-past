# WASM Build — zelda3 via Emscripten
#
# Prerequisites:
#   - Emscripten SDK installed and activated (source emsdk_env.sh / emsdk_env.bat)
#   - SDL2 (provided by Emscripten ports)
#
# Usage:
#   cd core/wasm-build
#   make
#
# Output goes to output/

ZELDA3_SRC := ../zelda3

CC       := emcc
CFLAGS   := -O2 -s USE_SDL=2 -s WASM=1
LDFLAGS  := -s ALLOW_MEMORY_GROWTH=1 \
            -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
            -s MODULARIZE=1 \
            -s EXPORT_NAME='Zelda3' \
            --preload-file $(ZELDA3_SRC)/tables@/tables

OUTPUT_DIR := output

.PHONY: all clean dirs

all: dirs
	@echo "WASM build not yet configured — see docs/wasm-build.md"

dirs:
	@mkdir -p $(OUTPUT_DIR)

clean:
	rm -rf $(OUTPUT_DIR)
