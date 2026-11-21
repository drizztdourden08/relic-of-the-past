/* @layer shared-asset-extraction @kind constants */
const TEXT_START = 0x9c8000;

const TEXT_END = 0x9cf356;

const MESSAGE_COUNT = 395;

const OP_FIRST_COMMAND = 0xf6;

const OP_END = 0xfb;

const OP_SPEED = 0xfc;

const OP_KANJI = 0xfd;

const OP_EXTENDED = 0xfe;

const OP_SPACE = 0xff;

const KANJI_BASE = 0x100;

const EXTENDED_LENGTH_TABLE = 0x9cf2fa;

const EXTENDED_PARAM_BIT = 0x80;

export {
  EXTENDED_LENGTH_TABLE, EXTENDED_PARAM_BIT, KANJI_BASE, MESSAGE_COUNT, OP_END, OP_EXTENDED, OP_FIRST_COMMAND, OP_KANJI,
  OP_SPACE, OP_SPEED, TEXT_END, TEXT_START,
};
