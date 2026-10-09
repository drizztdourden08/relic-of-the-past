/* @layer electron-main @kind logic */
import type { Profile } from '@shared/types/profile';
import { writeJson } from '../../lib/json-store';
import { profilePath } from './profile-path';

const updateProfile = (profile: Profile): Promise<void> =>
  writeJson(profilePath(profile.id), profile);

export { updateProfile };
