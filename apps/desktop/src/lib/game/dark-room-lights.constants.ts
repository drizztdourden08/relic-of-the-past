/* @layer bridge-wasm @kind constants */
const DARK_ROOM_LIGHT_BIT = {
  rod: 1024,
  medallion: 2048,
  redCane: 4096,
} as const;

const LAMP_ONLY_WORD = 0;

export { DARK_ROOM_LIGHT_BIT, LAMP_ONLY_WORD };
