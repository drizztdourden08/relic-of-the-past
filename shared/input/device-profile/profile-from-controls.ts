/* @layer shared-input @kind logic */
import { BUTTON_INDEX } from '../family';
import type { ResolvedControl, SdlAxisName, SdlButtonName } from '../family';
import { AXIS_ID_ALIAS } from './device-profile.constants';
import type { DeviceProfile, DeviceProfileAxis, DeviceProfileButton, DeviceProfileIdentity } from './device-profile.type';

const toButtonsByIndex = (controls: readonly ResolvedControl[]): DeviceProfile['buttonsByIndex'] => {
  const byIndex: DeviceProfile['buttonsByIndex'] = {};
  for (const c of controls) {
    if (c.kind !== 'button') continue;
    byIndex[BUTTON_INDEX[c.position as SdlButtonName]] = { icon: c.icon, label: c.label };
  }
  return byIndex;
};

const profileFromControls = (identity: DeviceProfileIdentity, controls: readonly ResolvedControl[]): DeviceProfile => {
  const buttons: DeviceProfileButton[] = [];
  const axes: DeviceProfileAxis[] = [];
  for (const c of controls) {
    if (c.kind === 'button') buttons.push({ id: c.position, label: c.label, icon: c.icon, category: c.category });
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

export { profileFromControls };
