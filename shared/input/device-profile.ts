/* @layer shared-input @kind logic */
/**
 * The calibration wizard's view of a device: an ordered buttons/axes list for display, plus an
 * icon+label lookup keyed by the binding index a stored ButtonMapping carries. Built from SDL's
 * capability report through the family layer (shared/input/family), never from a per-model database.
 */
// Import from the family barrel (./family), never the deep sdl-capabilities module: the barrel
// runs every family's self-registration (family-registry.ts); a deep import would see an empty registry.
import { BUTTON_INDEX, resolveDeviceControls } from './family';
import type { ResolvedControl, ResolvedDevice, SdlAxisName, SdlButtonName, SdlGamepadType } from './family';
import type { DeviceFamily, InputApi } from '../types/controls';

interface DeviceProfileButton {
  id: string;
  label: string;
  icon: string;
  category: 'face' | 'shoulder' | 'trigger' | 'dpad' | 'stick' | 'system';
}

interface DeviceProfileAxis {
  id: string;
  label: string;
  /** The family's base icon key for this axis (a stick's X and Y share one
   *  key; see resolveStickDirectionIcon for how a caller turns it into a
   *  direction-specific glyph). A trigger's icon is its own glyph directly. */
  icon: string;
  category: 'stick' | 'trigger';
}

interface DeviceProfile {
  id: string;
  name: string;
  vendorId: string | null;
  productId: string | null;
  family: DeviceFamily;
  inputApi: InputApi;
  buttons: DeviceProfileButton[];
  axes: DeviceProfileAxis[];
  buttonsByIndex: Record<number, { icon: string; label: string }>;
}

interface DeviceProfileIdentity {
  id: string;
  name: string;
  family: DeviceFamily;
  inputApi: InputApi;
  vendorId?: string;
  productId?: string;
}

/** Axis ids the calibration wizard groups sticks/triggers by (STICK_IDS/TRIGGER_IDS there),
 *  kept stable independent of SDL's positional names. */
const AXIS_ID_ALIAS: Partial<Record<SdlAxisName, string>> = {
  LEFT_X: 'leftX', LEFT_Y: 'leftY', RIGHT_X: 'rightX', RIGHT_Y: 'rightY',
  LEFT_TRIGGER: 'leftTrigger', RIGHT_TRIGGER: 'rightTrigger',
};

const toButtonsByIndex = (controls: readonly ResolvedControl[]): DeviceProfile['buttonsByIndex'] => {
  const byIndex: DeviceProfile['buttonsByIndex'] = {};
  for (const c of controls) {
    if (c.kind !== 'button') continue;
    byIndex[BUTTON_INDEX[c.position as SdlButtonName]] = { icon: c.icon, label: c.label };
  }
  return byIndex;
};

const fromControls = (identity: DeviceProfileIdentity, controls: readonly ResolvedControl[]): DeviceProfile => {
  const buttons: DeviceProfileButton[] = [];
  const axes: DeviceProfileAxis[] = [];
  for (const c of controls) {
    if (c.kind === 'button') buttons.push({ id: c.position, label: c.label, icon: c.icon, category: c.category });
    // AXIS_ORDER (sdl-capabilities.ts) only ever assigns 'stick' or 'trigger'
    // to an axis control; the wider ResolvedControlCategory union is never
    // actually reached here.
    else axes.push({ id: AXIS_ID_ALIAS[c.position as SdlAxisName] ?? c.position, label: c.label, icon: c.icon, category: c.category as 'stick' | 'trigger' });
  }
  return {
    ...identity,
    vendorId: identity.vendorId ?? null,
    productId: identity.productId ?? null,
    buttons,
    axes,
    buttonsByIndex: toButtonsByIndex(controls),
  };
};

/** Builds a DeviceProfile from a live device's SDL capability arrays; only positions it reports appear. */
const buildDeviceProfile = (identity: DeviceProfileIdentity, params: {
  sdlType: SdlGamepadType;
  hasButton: readonly boolean[];
  hasAxis: readonly boolean[];
  buttonLabels?: readonly string[];
}): DeviceProfile => {
  const controls = resolveDeviceControls({
    sdlType: params.sdlType,
    vendorId: identity.vendorId,
    productId: identity.productId,
    hasButton: params.hasButton,
    hasAxis: params.hasAxis,
    buttonLabels: params.buttonLabels ?? [],
  });
  return fromControls(identity, controls);
};

/** Reuses a ResolvedDevice already computed for a calibration/controls card,
 *  so a caller holding one need not resolve capabilities a second time. */
const buildDeviceProfileFromResolved = (identity: DeviceProfileIdentity, resolved: ResolvedDevice): DeviceProfile =>
  fromControls(identity, resolved.controls);

/** A synthetic full-capability profile for a device known only by sdlType (a disconnected
 *  saved binding, or the wizard's manual family-override picker). Every position the
 *  family/generic chain can label counts as present; there is no live hasButton/hasAxis. */
const ALL_BUTTONS = new Array(Object.keys(BUTTON_INDEX).length).fill(true);
const ALL_AXES = new Array(6).fill(true);

const buildDeviceProfileFromSdlType = (identity: DeviceProfileIdentity, sdlType: SdlGamepadType): DeviceProfile =>
  buildDeviceProfile(identity, { sdlType, hasButton: ALL_BUTTONS, hasAxis: ALL_AXES });

export { buildDeviceProfile, buildDeviceProfileFromResolved, buildDeviceProfileFromSdlType };
export type { DeviceProfile, DeviceProfileAxis, DeviceProfileButton, DeviceProfileIdentity };
