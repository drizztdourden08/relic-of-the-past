/**
 * Controller profiles — adapted from the registry's impl classes.
 * Provides backward-compatible ControllerProfile interface for UI consumers.
 */

import { findController, getAllControllers } from '../register-all';
import type { BaseController, ControllerButton, ControllerAxis } from '../base';

export interface ControllerProfileButton {
  id: string;
  label: string;
  icon: string;
  category: 'face' | 'shoulder' | 'trigger' | 'dpad' | 'stick' | 'system';
}

export interface ControllerProfileAxis {
  id: string;
  label: string;
  category: 'stick' | 'trigger';
}

export interface ControllerProfile {
  id: string;
  name: string;
  vendorId: string | null;
  productId: string | null;
  family: string;
  inputApi: string;
  buttons: ControllerProfileButton[];
  axes: ControllerProfileAxis[];
  supportsVibration: boolean;
}

/** Adapt a BaseController to the legacy ControllerProfile interface. */
function toProfile(ctrl: BaseController): ControllerProfile {
  return {
    id: ctrl.id,
    name: ctrl.name,
    vendorId: ctrl.vendorIds[0] ?? null,
    productId: ctrl.productIds[0] ?? null,
    family: ctrl.family,
    inputApi: ctrl.inputApi,
    buttons: ctrl.buttons.map((b: ControllerButton) => ({
      id: b.id,
      label: b.label,
      icon: b.icon,
      category: b.category,
    })),
    axes: ctrl.axes.map((a: ControllerAxis) => ({
      id: a.id,
      label: a.label,
      category: a.category,
    })),
    supportsVibration: ctrl.supportsVibration(),
  };
}

export const CONTROLLER_PROFILES: ControllerProfile[] = getAllControllers().map(toProfile);

/** Find profile by VID/PID (hex strings, auto-pads to 4 chars). */
export function findProfileByVidPid(vid: string, pid: string): ControllerProfile | null {
  const ctrl = findController(vid, pid);
  return ctrl ? toProfile(ctrl) : null;
}

/** Find profile by id */
export function findProfileById(id: string): ControllerProfile | null {
  const ctrl = getAllControllers().find(c => c.id === id);
  return ctrl ? toProfile(ctrl) : null;
}
