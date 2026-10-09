/* @layer bridge-wasm @kind constants */
const MAX_EVENTS = 120;

const MUSIC_CODES: Record<number, string> = {
  0xf0: 'pause', 0xf1: 'fade out', 0xf2: 'duck', 0xf3: 'full volume',
};

export { MAX_EVENTS, MUSIC_CODES };
