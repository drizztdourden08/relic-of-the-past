# Credits

> Keep in sync with `shared/data/credits.ts`

## Game & Core Engine

| Who | Project | Use | License |
|-----|---------|-----|---------|
| **Nintendo** | The Legend of Zelda: A Link to the Past (1991) | Original Work — the entire project is built around their game | — |
| **snesrev** | [zelda3](https://github.com/snesrev/zelda3) | Core Dependency — vendored C codebase compiled to WebAssembly; the game engine itself | MIT |
| **elzo-d** | [LakeSnes](https://github.com/elzo-d/LakeSnes) | Core Dependency — PPU/DSP code included within snesrev/zelda3 | MIT |
| **spannerism** | Zelda 3 JP Disassembly | Reference — function and variable naming reference used by snesrev | — |

## Launcher Inspiration

| Who | Project | Use | License |
|-----|---------|-----|---------|
| **RadzPrower** | [Zelda-3-Launcher](https://github.com/RadzPrower/Zelda-3-Launcher) | Inspiration — UI/UX concept for wrapping zelda3 in a launcher; no code used | MIT |

## Controller Support

| Who | Project | Use | License |
|-----|---------|-----|---------|
| **mdqinc + contributors** | [SDL_GameControllerDB](https://github.com/mdqinc/SDL_GameControllerDB) | Data Used Directly — controller mapping database vendored and parsed into TypeScript controller list | Zlib |
| **HandHeldLegend** | [procon2tool](https://handheldlegend.github.io/procon2tool) | Reference — USB init sequence and haptic patterns studied and reimplemented in TypeScript; no code copied directly | — |
| **RyanCopley** | [NSO-GameCube-Controller-Pairing-App](https://github.com/RyanCopley/NSO-GameCube-Controller-Pairing-App) | Reference — studied to understand NSO GameCube controller pairing protocol; no code taken | — |

## Button & Controller Icons

| Who | Project | Use | License |
|-----|---------|-----|---------|
| **Kenney** | [Input Prompts](https://kenney.nl/assets/input-prompts) | Assets Used Directly — Switch, Xbox, PlayStation, GameCube, Keyboard, and Generic SVG icons used as-is for button prompts | CC0 |
| **Tiago Alexander** | [SNES Controller in Sketch](https://www.sketchappsources.com/free-source/4788-snes-controller-sketch-freebie-resource.html) | Assets Modified — Sketch file converted to Figma, individual button SVGs exported and heavily modified for SNES button prompts | — |

## Randomizer Logic

| Who | Project | Use | License |
|-----|---------|-----|---------|
| **Archipelago** | [Archipelago Multiworld](https://archipelago.gg) | Logic Reference — ruleset, region structure, check flags, and entrance naming studied and reimplemented in TypeScript; no code copied directly | MIT |
