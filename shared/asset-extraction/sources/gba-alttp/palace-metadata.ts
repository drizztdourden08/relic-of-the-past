/* @layer shared-asset-extraction @kind data */
const PALACE_BOSS_ROOMS = {
  0x69: { name: 'Helmasaur King II', entityTypes: [0x92] },
  0xad: { name: 'Mothula II', entityTypes: [0x88] },
  0xcd: { name: 'Arrghus II', entityTypes: [0x8c, 0x8d] },
  0xec: { name: 'Blind II', entityTypes: [0xce] },
} as const;

const GBA_NEW_ENTITY_HANDLERS = {
  0xf5: { purpose: 'Palace entrance gatekeeper', main: 0x080e5570 },
  0xf6: { purpose: 'Riddle Quest actor; outside Palace scope', main: 0x080e57fc },
  0xf7: { purpose: 'Riddle Quest actor; outside Palace scope', main: 0x080d6478 },
  0xf8: { purpose: 'Palace marker with no normal dispatch entry; semantic handler unresolved', main: null },
} as const;

const PALACE_ROOM_TAGS = {
  0x40: { purpose: 'Palace-specific room event', main: 0x0807b7c0 },
  0x41: { purpose: 'Palace final-sequence event A', main: 0x0807b244 },
  0x42: { purpose: 'Palace final-sequence event B', main: 0x0807a088 },
} as const;

const ROOM_TAG_HANDLER_TABLE = 0x08152ac4;

const PALACE_BEHAVIOR_SPECS = {
  roomTags: {
    0x40: {
      status: 'requires-port',
      triggerHelper: 0x080cafb4,
      effects: ['play GBA sound 0x7B', 'set room event state 0x1C', 'clear active tag slot'],
    },
    0x41: {
      status: 'requires-port',
      triggerHelper: 0x0807b100,
      effects: ['advance a 0x13-step room state', 'play GBA sound 0x7B', 'toggle room state bit', 'rebuild room state'],
    },
    0x42: {
      status: 'requires-port',
      triggerHelper: 0x08079f90,
      effects: ['test active room actors and room state', 'update room transition state', 'play GBA sound 0x3B'],
    },
  },
  specialMarkerF8: {
    status: 'requires-port',
    normalDispatchEntry: null,
    observedConsumer: 0x080c68bc,
    replacementHelper: 0x080c66a4,
    replacementType: 0xe6,
  },
  modifiedBosses: PALACE_BOSS_ROOMS,
} as const;

const PALACE_PROGRESSION_ANCHORS = {
  palaceAccessRuntime: 0x030031d8,
  swordPieceRuntime: 0x030038e3,
  riddleQuestRuntime: 0x03003182,
  hurricaneSpinSaveSlotByte: 0,
  hurricaneSpinMask: 0x02,
  swordBeamMask: 0x01,
} as const;

const PALACE_AUDIO_REFERENCES = [
  { source: 'room-tag-0x40', gbaSoundId: 0x7b },
  { source: 'room-tag-0x41', gbaSoundId: 0x7b },
  { source: 'room-tag-0x42', gbaSoundId: 0x3b },
] as const;

const PALACE_ENTITY_TYPES = {
  0x08: { name: 'Octorok', portability: 'inherited' },
  0x0a: { name: 'Octorok variant', portability: 'inherited' },
  0x0f: { name: 'Octoballoon', portability: 'inherited' },
  0x10: { name: 'Octoballoon baby', portability: 'inherited' },
  0x1e: { name: 'Crystal switch', portability: 'inherited' },
  0x23: { name: 'Red Bari', portability: 'inherited' },
  0x24: { name: 'Blue Bari', portability: 'inherited' },
  0x26: { name: 'Hardhat Beetle', portability: 'inherited' },
  0x40: { name: 'Tutorial guard/barrier', portability: 'inherited' },
  0x5b: { name: 'Spark clockwise', portability: 'inherited' },
  0x5d: { name: 'Roller', portability: 'inherited' },
  0x66: { name: 'Wall cannon', portability: 'inherited' },
  0x67: { name: 'Wall cannon variant', portability: 'inherited' },
  0x6f: { name: 'Keese', portability: 'inherited' },
  0x88: { name: 'Mothula II', portability: 'modified-boss' },
  0x8c: { name: 'Arrghus II', portability: 'modified-boss' },
  0x8d: { name: 'Arrghi', portability: 'modified-boss-component' },
  0x8e: { name: 'Terrorpin', portability: 'inherited' },
  0x91: { name: 'Stalfos Knight', portability: 'inherited' },
  0x92: { name: 'Helmasaur King II', portability: 'modified-boss' },
  0x93: { name: 'Bumper', portability: 'inherited' },
  0xa5: { name: 'Zazak red', portability: 'inherited' },
  0xa6: { name: 'Zazak blue', portability: 'inherited' },
  0xa7: { name: 'Stalfos', portability: 'inherited' },
  0xca: { name: 'Chain Chomp', portability: 'inherited' },
  0xce: { name: 'Blind II', portability: 'modified-boss' },
  0xf5: { name: 'Palace gatekeeper', portability: 'gba-new' },
  0xf8: { name: 'Palace special marker', portability: 'special-marker' },
} as const;

export {
  GBA_NEW_ENTITY_HANDLERS,
  PALACE_AUDIO_REFERENCES,
  PALACE_BEHAVIOR_SPECS,
  PALACE_BOSS_ROOMS,
  PALACE_ENTITY_TYPES,
  PALACE_PROGRESSION_ANCHORS,
  PALACE_ROOM_TAGS,
  ROOM_TAG_HANDLER_TABLE,
};
