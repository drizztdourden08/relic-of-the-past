/* @layer shared-input @kind constants */
import type { OrientationLayout } from '@rotp/features';

const DEFAULT_PORTRAIT_LAYOUT: OrientationLayout = {
  movementType: 'dynamic-stick',
  movements: {
    'dynamic-stick': { zone: { x: 0, y: 0.58, w: 0.5, h: 0.34 }, scale: 1.4, deadZone: 0.18 },
    'fixed-stick': { at: { x: 0.24, y: 0.75 }, scale: 1.4, deadZone: 0.18 },
    dpad: { at: { x: 0.24, y: 0.75 }, scale: 1.5 },
  },
  groups: [{ id: 'face', label: 'Face buttons', locked: true }],
  buttons: [
    { id: 'a', emit: 'a', label: 'A', at: { x: 0.9, y: 0.75 }, scale: 1, shape: 'round', group: 'face' },
    { id: 'b', emit: 'b', label: 'B', at: { x: 0.78, y: 0.805 }, scale: 1, shape: 'round', group: 'face' },
    { id: 'x', emit: 'x', label: 'X', at: { x: 0.78, y: 0.695 }, scale: 1, shape: 'round', group: 'face' },
    { id: 'y', emit: 'y', label: 'Y', at: { x: 0.66, y: 0.75 }, scale: 1, shape: 'round', group: 'face' },
    { id: 'l', emit: 'l', label: 'L', at: { x: 0.12, y: 0.53 }, scale: 1, shape: 'pill', group: null },
    { id: 'r', emit: 'r', label: 'R', at: { x: 0.88, y: 0.53 }, scale: 1, shape: 'pill', group: null },
    { id: 'select', emit: 'select', label: 'SELECT', at: { x: 0.39, y: 0.95 }, scale: 0.8, shape: 'pill', group: null },
    { id: 'start', emit: 'start', label: 'START', at: { x: 0.61, y: 0.95 }, scale: 0.8, shape: 'pill', group: null },
  ],
};

export { DEFAULT_PORTRAIT_LAYOUT };
