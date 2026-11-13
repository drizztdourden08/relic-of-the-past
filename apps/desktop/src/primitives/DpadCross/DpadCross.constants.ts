/* @layer renderer-app @kind constants */
import type { DpadArm } from './DpadCross.type';

const CROSS_PATH = [
  'M-20,-96 H20 A8,8 0 0 1 28,-88 V-33 A5,5 0 0 0 33,-28',
  'H88 A8,8 0 0 1 96,-20 V20 A8,8 0 0 1 88,28 H33 A5,5 0 0 0 28,33',
  'V88 A8,8 0 0 1 20,96 H-20 A8,8 0 0 1 -28,88 V33 A5,5 0 0 0 -33,28',
  'H-88 A8,8 0 0 1 -96,20 V-20 A8,8 0 0 1 -88,-28 H-33 A5,5 0 0 0 -28,-33',
  'V-88 A8,8 0 0 1 -20,-96 Z',
].join(' ');

const ARM_RADIUS = 8;

const HUB_RADIUS = 14;

const DPAD_ARMS: readonly DpadArm[] = [
  { key: 'up', rect: { x: -28, y: -96, width: 56, height: 68 }, notch: 'M-12,-52 L0,-70 L12,-52 Z' },
  { key: 'down', rect: { x: -28, y: 28, width: 56, height: 68 }, notch: 'M-12,52 L0,70 L12,52 Z' },
  { key: 'left', rect: { x: -96, y: -28, width: 68, height: 56 }, notch: 'M-52,-12 L-70,0 L-52,12 Z' },
  { key: 'right', rect: { x: 28, y: -28, width: 68, height: 56 }, notch: 'M52,-12 L70,0 L52,12 Z' },
];

export { ARM_RADIUS, CROSS_PATH, DPAD_ARMS, HUB_RADIUS };
