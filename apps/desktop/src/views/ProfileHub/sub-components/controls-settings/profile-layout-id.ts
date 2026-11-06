/* @layer renderer-components @kind logic */
import type { InputProfile } from '@drizztdourden08/brock-input';

const profileLayoutId = (profile: InputProfile): string | undefined => {
  const value = profile.extension?.layoutId;
  return typeof value === 'string' ? value : undefined;
};

export { profileLayoutId };
