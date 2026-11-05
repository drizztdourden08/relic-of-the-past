/* @layer renderer-components @kind logic */
import type { InputProfile } from '@drizztdourden08/brock-input';

const profileLayoutId = (profile: InputProfile): string | undefined => {
  const value: unknown = Reflect.get(profile, 'layoutId');
  return typeof value === 'string' ? value : undefined;
};

export { profileLayoutId };
