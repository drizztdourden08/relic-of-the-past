/* @layer shared-input @kind data */
/**
 * Shared helpers for building gamepad controller presets — icon descriptors and
 * button/axis mapping factories. Used by every preset in this folder.
 */
import type { ButtonMapping, ButtonIcon } from '../../../types/controls';

const icon = (key: string, label: string): ButtonIcon => ({ key, path: null, label });

const btn = (snesButton: ButtonMapping['snesButton'], index: number, iconData: ButtonIcon | null): ButtonMapping => {
  return { snesButton, binding: { type: 'gamepad-button', index }, icon: iconData };
};

const axis = (snesButton: ButtonMapping['snesButton'], axisIndex: number, direction: '+' | '-', iconData: ButtonIcon | null): ButtonMapping => {
  return { snesButton, binding: { type: 'gamepad-axis', axisIndex, direction }, icon: iconData };
};

export { icon, btn, axis };
