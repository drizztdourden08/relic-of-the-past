/* @layer shared-input @kind constants */
import type { OrientationLayout } from '@rotp/features';

const DEFAULT_LANDSCAPE_LAYOUT: OrientationLayout = {
  movementType: 'dynamic-stick',
  movements: {
    'dynamic-stick': { zone: { x: 0, y: 0.3, w: 0.29, h: 0.7 }, scale: 1.4, deadZone: 0.18 },
    'fixed-stick': { at: { x: 0.14, y: 0.66 }, scale: 1.4, deadZone: 0.18 },
    dpad: { at: { x: 0.14, y: 0.66 }, scale: 1.5 },
  },
  groups: [{ id: 'face', label: 'Face buttons', locked: true }],
  buttons: [
    { id: 'a', emit: 'a', label: 'A', at: { x: 0.935, y: 0.68 }, scale: 1, shape: 'round', group: 'face' },
    { id: 'b', emit: 'b', label: 'B', at: { x: 0.88, y: 0.8 }, scale: 1, shape: 'round', group: 'face' },
    { id: 'x', emit: 'x', label: 'X', at: { x: 0.88, y: 0.56 }, scale: 1, shape: 'round', group: 'face' },
    { id: 'y', emit: 'y', label: 'Y', at: { x: 0.825, y: 0.68 }, scale: 1, shape: 'round', group: 'face' },
    { id: 'l', emit: 'l', label: 'L', at: { x: 0.08, y: 0.18 }, scale: 1, shape: 'pill', group: null },
    { id: 'r', emit: 'r', label: 'R', at: { x: 0.92, y: 0.18 }, scale: 1, shape: 'pill', group: null },
    { id: 'select', emit: 'select', label: 'SELECT', at: { x: 0.215, y: 0.93 }, scale: 0.8, shape: 'pill', group: null },
    { id: 'start', emit: 'start', label: 'START', at: { x: 0.785, y: 0.93 }, scale: 0.8, shape: 'pill', group: null },
  ],
};

export { DEFAULT_LANDSCAPE_LAYOUT };
