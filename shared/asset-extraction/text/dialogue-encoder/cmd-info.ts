/* @layer shared-asset-extraction @kind logic */
import type { CommandInfo, CommandParamMap } from './dialogue-encoder.type';

const sixteenFrom = (base: number): CommandParamMap =>
  Object.fromEntries(Array.from({ length: 16 }, (_, i) => [i, i + base]));

const kCmdInfo: Record<string, CommandInfo> = {
  Scroll: [0x80],
  Waitkey: [0x81],
  '1': [0x82],
  '2': [0x83],
  '3': [0x84],
  Name: [0x85],
  Wait: [0x87, sixteenFrom(0x00)],
  Color: [0x87, sixteenFrom(0x10)],
  Number: [0x87, sixteenFrom(0x20)],
  Speed: [0x87, sixteenFrom(0x30)],
  Sound: [0x87, { 45: 0x40, 64: null } as CommandParamMap],
  Choose: [0x87, 0x80],
  Choose2: [0x87, 0x81],
  Choose3: [0x87, 0x82],
  Selchg: [0x87, 0x83],
  Item: [0x87, 0x84],
  NextPic: [0x87, 0x85],
  Window: [0x87, { 0: null, 2: 0x86 } as CommandParamMap],
  Position: [0x87, { 0: 0x87, 1: 0x88 } as CommandParamMap],
  ScrollSpd: [0, { 0: null } as CommandParamMap],
};

export { kCmdInfo };
