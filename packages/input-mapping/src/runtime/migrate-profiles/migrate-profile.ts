/* @layer renderer-lib @kind logic */
import { migrateSlotList } from '../../scheme';
import type { InputProfile } from '../../controls/devices/devices.type';

const migrateProfile = (raw: unknown): InputProfile => {
  const profile = raw as InputProfile & { modern?: { core: unknown; slots: unknown } };
  if (!profile.modern) return profile;
  const { slots } = migrateSlotList(profile.modern.slots);
  return { ...profile, modern: { ...profile.modern, slots } } as InputProfile;
};

export { migrateProfile };
