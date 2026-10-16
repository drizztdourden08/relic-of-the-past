/* @layer renderer-components @kind logic */
import { listSessions, readInputProfiles } from '@app/storage/profile-data-store';
import { getSlotInfos, listAutoSaves, listNormalSaves, readSram } from '@app/storage/saves-store';
import type { ProfileData } from './profile-data.type';

const orElse = async <T>(read: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await read();
  } catch {
    return fallback;
  }
};

const loadProfileData = async (profileId: string): Promise<ProfileData> => {
  const [manual, auto, quick, sram, sessions, inputProfiles] = await Promise.all([
    orElse(() => listNormalSaves(profileId), []),
    orElse(() => listAutoSaves(profileId), []),
    orElse(() => getSlotInfos(profileId), []),
    orElse(() => readSram(profileId), null),
    orElse(() => listSessions(profileId), []),
    orElse(() => readInputProfiles(profileId), []),
  ]);
  return { manual, auto, quick, sramBytes: sram?.byteLength ?? null, sessions, inputProfiles };
};

export { loadProfileData };
