/* @layer renderer-app @kind constants */
import type { DpadReading } from '@rotp/input-mapping';

/** The cross drawn in a -100..100 box; each arm is a rectangle plus an arrow notch. */
const CROSS_PATH = 'M-28,-96 H28 V-28 H96 V28 H28 V96 H-28 V28 H-96 V-28 H-28 Z';

const HUB_RADIUS = 14;

interface DpadArm {
  key: keyof DpadReading;
  rect: { x: number; y: number; width: number; height: number };
  notch: string;
}

const DPAD_ARMS: readonly DpadArm[] = [
  { key: 'up', rect: { x: -28, y: -96, width: 56, height: 68 }, notch: 'M-12,-52 L0,-70 L12,-52 Z' },
  { key: 'down', rect: { x: -28, y: 28, width: 56, height: 68 }, notch: 'M-12,52 L0,70 L12,52 Z' },
  { key: 'left', rect: { x: -96, y: -28, width: 68, height: 56 }, notch: 'M-52,-12 L-70,0 L-52,12 Z' },
  { key: 'right', rect: { x: 28, y: -28, width: 68, height: 56 }, notch: 'M52,-12 L70,0 L52,12 Z' },
];

export { CROSS_PATH, DPAD_ARMS, HUB_RADIUS };
export type { DpadArm };
