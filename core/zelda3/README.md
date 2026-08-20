# Zelda3
A reimplementation of Zelda 3.

Our discord server is: https://discord.gg/AJJbJAzNNJ

> **Note — vendored, and reduced to what this project compiles.**
>
> *Relic of the Past* vendors this reimplementation, builds it to WebAssembly and drives
> it from an Electron app. What remains here is the game logic plus the graphics,
> register-transfer and audio-mixer units it writes registers to — there is no desktop
> front-end, no CPU emulation and no Python tooling in this copy, so the upstream build
> and usage instructions below no longer apply and have been dropped.
>
> Build and run it through the repository root instead: see
> `docs/contributing/building-wasm.md` and `docs/contributing/build-from-source.md`. The
> sections that follow are upstream's own words, kept for attribution.

## About

This is a reverse engineered clone of Zelda 3 - A Link to the Past.

It's around 70-80kLOC of C code, and reimplements all parts of the original game. The game is playable from start to end.

You need a copy of the ROM to extract game resources (levels, images). Then once that's done, the ROM is no longer needed.

It uses the PPU and DSP implementation from [LakeSnes](https://github.com/elzo-d/LakeSnes), but with lots of speed optimizations.
Additionally, it can be configured to also run the original machine code side by side. Then the RAM state is compared after each frame, to verify that the C implementation is correct.

I got much assistance from spannerism's Zelda 3 JP disassembly and the other ones that documented loads of function names and variables.

## Additional features

A bunch of features have been added that are not supported by the original game. Some of them are:

Support for pixel shaders.

Support for enhanced aspect ratios of 16:9 or 16:10.

Higher quality world map.

Support for MSU audio tracks.

Secondary item slot on button X (Hold X in inventory to select).

Switching current item with L/R keys.

## More Compilation Help

Look at the wiki at https://github.com/snesrev/zelda3/wiki for more help.

## License

This project is licensed under the MIT license. See 'LICENSE.txt' for details.
