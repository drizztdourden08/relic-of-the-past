/* @layer renderer-lib @kind logic */
import { startupFlag } from '../startup-flag';

const profileNameFlag = (): string | null => {
  const raw = startupFlag('profile-name');
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  return raw.trim();
};

export { profileNameFlag };
