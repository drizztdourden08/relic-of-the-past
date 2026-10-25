/* @layer renderer-lib @kind logic */
import { effectiveModernBindings } from '../../scheme';
import type { DeviceEntry, ResolvedControl } from '@drizztdourden08/brock-input';
import type { InputProfile } from '../../controls/devices/devices.type';
import type { ModernBindings } from '@rotp/game-data';
import { resolveDeviceFromEntry } from '@drizztdourden08/brock-input/renderer';
import { profileDevice } from './profile-device';
import { resolveCoreBindings } from './resolve-core-bindings';

const profileControls = (profile: InputProfile, devices: readonly DeviceEntry[]): readonly ResolvedControl[] => {
  if (profile.deviceType === 'keyboard') return [];
  const entry = profileDevice(profile, devices);
  return entry ? resolveDeviceFromEntry(entry).controls : [];
};

const resolveModernBindings = (profile: InputProfile | null, devices: readonly DeviceEntry[]): ModernBindings | null => {
  if (!profile) return null;
  const core = resolveCoreBindings(profile, devices);
  if (!core) return null;
  const keyboard = profile.deviceType === 'keyboard';
  const controls = profileControls(profile, devices);
  if (!keyboard && controls.length === 0 && !profile.modern) return null;
  return effectiveModernBindings({
    core, controls, keyboard, stored: profile.modern?.slots, layoutId: profile.modern?.layoutId,
  });
};

export { resolveModernBindings };
