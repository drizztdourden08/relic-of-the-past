/* @layer shared-game @kind data */
/**
 * Label maps over the ENGINE's own enumerations. Each key is a value the game
 * produces at runtime; each value is only a display name. No inference, no
 * per-room knowledge, nothing authored here beyond the words themselves.
 * 1:1 with the upstream tables in core/zelda3/assets/tables.py
 * (kEffectNames / kCollisionNames).
 *
 * NOTE: there is deliberately no room-KIND map here. The game has no
 * cave-vs-house field, so any such map would be an invention.
 */

const LAYER_EFFECT_NAMES: readonly string[] = [
  'None', '01', 'Moving floor', 'Moving water', '04',
  'Red flashes', 'Light torch to see floor', 'Ganon room',
];

const COLLISION_MODE_NAMES: readonly string[] = [
  'One', 'Both', 'Both w/scroll', 'Moving floor', 'Moving water',
];

/** dung_replacement_tile_state[] encodings — the 0x70-0x7F slot family. */
const MANIPULABLE_NAMES: Readonly<Record<number, string>> = {
  0x1010: 'pot',
  0x2020: 'large block',
  0x4040: 'hammer peg',
  0x3030: 'bombable floor',
};

export { LAYER_EFFECT_NAMES, COLLISION_MODE_NAMES, MANIPULABLE_NAMES };
