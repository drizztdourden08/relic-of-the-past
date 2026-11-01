/* @layer renderer-lib @kind logic */
import { startupFlag } from '../startup-flag';

/** The name given with --profile-name=<name>, or null when the flag is absent or empty. */
const profileNameFlag = (): string | null => {
  const raw = startupFlag('profile-name');
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  return raw.trim();
};

export { profileNameFlag };
