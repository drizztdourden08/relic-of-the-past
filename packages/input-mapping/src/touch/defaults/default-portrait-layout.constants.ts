/* @layer shared-input @kind constants */
import type { OrientationLayout } from '@rotp/features';
import { MENU_FORM, ROUND_FORM, SHOULDER_FORM } from '../editing/button-forms.constants';

const DEFAULT_PORTRAIT_LAYOUT: OrientationLayout = {
  movementType: 'dynamic-stick',
  movements: {
    'dynamic-stick': { zone: { x: 0, y: 0.58, w: 0.5, h: 0.34 }, scale: 1.4, deadZone: 0.18 },
    'fixed-stick': { at: { x: 0.24, y: 0.75 }, scale: 1.4, deadZone: 0.18 },
    dpad: { at: { x: 0.24, y: 0.75 }, scale: 1.5 },
  },
  groups: [{ id: 'face', label: 'Face buttons', locked: true }],
  buttons: [
    { id: 'a', emit: 'a', label: 'A', at: { x: 0.9, y: 0.75 }, scale: 1, ...ROUND_FORM, group: 'face' },
    { id: 'b', emit: 'b', label: 'B', at: { x: 0.78, y: 0.805 }, scale: 1, ...ROUND_FORM, group: 'face' },
    { id: 'x', emit: 'x', label: 'X', at: { x: 0.78, y: 0.695 }, scale: 1, ...ROUND_FORM, group: 'face' },
    { id: 'y', emit: 'y', label: 'Y', at: { x: 0.66, y: 0.75 }, scale: 1, ...ROUND_FORM, group: 'face' },
    { id: 'l', emit: 'l', label: 'L', at: { x: 0.17, y: 0.53 }, scale: 1, ...SHOULDER_FORM, group: null },
    { id: 'r', emit: 'r', label: 'R', at: { x: 0.83, y: 0.53 }, scale: 1, ...SHOULDER_FORM, group: null },
    { id: 'select', emit: 'select', label: 'SELECT', at: { x: 0.33, y: 0.95 }, scale: 0.8, ...MENU_FORM, group: null },
    { id: 'start', emit: 'start', label: 'START', at: { x: 0.67, y: 0.95 }, scale: 0.8, ...MENU_FORM, group: null },
  ],
};

export { DEFAULT_PORTRAIT_LAYOUT };
