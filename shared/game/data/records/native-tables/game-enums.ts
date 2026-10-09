/* @layer shared-game @kind data */
const LAYER_EFFECT_NAMES: readonly string[] = [
  'None', '01', 'Moving floor', 'Moving water', '04',
  'Red flashes', 'Light torch to see floor', 'Ganon room',
];

const COLLISION_MODE_NAMES: readonly string[] = [
  'One', 'Both', 'Both w/scroll', 'Moving floor', 'Moving water',
];

const MANIPULABLE_NAMES: Readonly<Record<number, string>> = {
  0x1010: 'pot',
  0x2020: 'large block',
  0x4040: 'hammer peg',
  0x3030: 'bombable floor',
};

export { LAYER_EFFECT_NAMES, COLLISION_MODE_NAMES, MANIPULABLE_NAMES };
