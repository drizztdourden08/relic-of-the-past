/* @layer electron-main @kind logic */
import type { Sdl3Input } from './sdl3.type';

const addonState = { addon: null as Sdl3Input | null, attempted: false };

export { addonState };
