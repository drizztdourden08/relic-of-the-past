/* @layer electron-main @kind logic */
import type { Profile } from '@shared/types/profile';
import { readJson } from '../../lib/json-store';
import { profilePath } from './profile-path';

const loadProfile = (id: string): Promise<Profile | null> =>
  readJson<Profile | null>(profilePath(id), null);

export { loadProfile };
