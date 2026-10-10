/* @layer renderer-components @kind logic */
import type { InputProfile } from '@rotp/input-mapping';

const firstProfile = (profiles: readonly InputProfile[]): InputProfile => {
  const [first] = profiles;
  if (!first) throw new Error('the input profile list is empty');
  return first;
};

export { firstProfile };
