/* @layer tests @kind helper */
import type { MenuItem } from '@drizztdourden08/tessera/composites';

const entryLookup = (entries: MenuItem[]) => (key: string): MenuItem => {
  const found = entries.find((entry) => entry.key === key);
  if (!found) throw new Error(`no menu entry ${key}`);
  return found;
};

export { entryLookup };
