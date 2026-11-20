/* @layer shared-asset-extraction @kind constants */
import { kLanguages } from '../../text/data/language-data/language-data.constants';

const US_COMMAND_START = 0x67;

const US_COMMAND_NAMES: readonly string[] = kLanguages.us.commandNames;

const US_PARAM_COMMANDS: ReadonlySet<number> = new Set([0x6b, 0x6c, 0x6d, 0x6e, 0x77, 0x78, 0x79, 0x7a]);

const US_SCROLL = 0x73;

const US_ROW_1 = 0x74;

const US_ROW_2 = 0x75;

const US_ROW_3 = 0x76;

const US_SPEED = 0x7a;

const US_WAITKEY = 0x7e;

const JAPANESE_SIMPLE_COMMANDS: ReadonlyMap<number, number> = new Map([
  [0xf6, US_SCROLL],
  [0xf7, US_ROW_1],
  [0xf8, US_ROW_2],
  [0xf9, US_ROW_3],
  [0xfa, US_WAITKEY],
  [0xfc, US_SPEED],
]);

const JAPANESE_EXTENDED_COMMANDS: ReadonlySet<number> = new Set([
  0x67, 0x68, 0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x71, 0x72, 0x77, 0x78, 0x79,
]);

export {
  JAPANESE_EXTENDED_COMMANDS, JAPANESE_SIMPLE_COMMANDS, US_COMMAND_NAMES, US_COMMAND_START, US_PARAM_COMMANDS,
};
