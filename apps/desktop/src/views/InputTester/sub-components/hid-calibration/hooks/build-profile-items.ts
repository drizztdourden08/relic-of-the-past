/* @layer renderer-components @kind logic */
import type { DeviceProfile } from '@rotp/input-mapping';
import type { InputItem } from '../hid-calibration.type';
import type { ProfileAxis } from './build-profile-items.type';

const toAxisItem = (a: ProfileAxis): InputItem => ({ kind: 'axis', id: a.id, label: a.label, category: a.category, status: 'pending' });

const buildProfileItems = (profile: DeviceProfile, stickIds: ReadonlySet<string>, triggerIds: ReadonlySet<string>): InputItem[] => {
  const sticks = profile.axes.filter(a => stickIds.has(a.id)).map(toAxisItem);
  const triggers = profile.axes.filter(a => triggerIds.has(a.id)).map(toAxisItem);
  const buttons = profile.buttons.map((b): InputItem => ({ kind: 'button', id: b.id, label: b.label, category: b.category, status: 'pending' }));
  const others = profile.axes.filter(a => !stickIds.has(a.id) && !triggerIds.has(a.id)).map(toAxisItem);
  return [...sticks, ...triggers, ...buttons, ...others];
};

export { buildProfileItems };
