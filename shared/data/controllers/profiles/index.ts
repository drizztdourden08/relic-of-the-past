/**
 * Controller profiles — static JSON definitions for known controllers.
 * Each profile defines the buttons and axes a controller has, with labels and icons.
 * Used by the calibration wizard to know what to ask the user to press.
 */

import switchPro2 from './switch-pro-2.json';
import switchPro from './switch-pro.json';
import xboxOne from './xbox-one.json';
import dualsense from './dualsense.json';
import dualshock4 from './dualshock4.json';
import eightBitDoPro2 from './8bitdo-pro2.json';
import generic from './generic.json';

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
}

export const CONTROLLER_PROFILES: ControllerProfile[] = [
  switchPro2 as ControllerProfile,
  switchPro as ControllerProfile,
  xboxOne as ControllerProfile,
  dualsense as ControllerProfile,
  dualshock4 as ControllerProfile,
  eightBitDoPro2 as ControllerProfile,
  generic as ControllerProfile,
];

/** Find profile by VID/PID (hex strings, auto-pads to 4 chars).
 * Falls back to matching by vendor family (e.g. any Xbox PID → Xbox profile). */
export function findProfileByVidPid(vid: string, pid: string): ControllerProfile | null {
  const v = vid.toLowerCase().padStart(4, '0');
  const p = pid.toLowerCase().padStart(4, '0');
  // Exact match first
  const exact = CONTROLLER_PROFILES.find(
    (pr) => pr.vendorId?.toLowerCase().padStart(4, '0') === v && pr.productId?.toLowerCase().padStart(4, '0') === p
  );
  if (exact) return exact;
  // Family match: find profile whose vendor matches (all Xbox controllers share VID 045e)
  const familyMatch = CONTROLLER_PROFILES.find(
    (pr) => pr.vendorId?.toLowerCase().padStart(4, '0') === v
  );
  return familyMatch ?? null;
}

/** Find profile by id */
export function findProfileById(id: string): ControllerProfile | null {
  return CONTROLLER_PROFILES.find((pr) => pr.id === id) ?? null;
}
