/* @layer renderer-appshell @kind constants */
const UI_STATE_OFFSETS = {
  palaceIndex: 75,
  roomIndex: 77,
  overworldScreenIndex: 109,
  isIndoors: 111,
  whichEntrance: 119,
} as const;

const NO_PALACE = 0xFF;

const LAYER_TOGGLE_DOOR_TYPE = 22;

const LAYER_TOGGLE_ATTR_FIRST = 0x90;
const LAYER_TOGGLE_ATTR_LAST = 0x97;

const DUMP_SETTLE_MS = 3000;

export {
  DUMP_SETTLE_MS, LAYER_TOGGLE_ATTR_FIRST, LAYER_TOGGLE_ATTR_LAST, LAYER_TOGGLE_DOOR_TYPE,
  NO_PALACE, UI_STATE_OFFSETS,
};
