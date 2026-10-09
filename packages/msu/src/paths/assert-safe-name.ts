/* @layer shared-storage @kind logic */
import { isSafeName } from './is-safe-name';

const assertSafeName = (name: string): void => {
  if (!isSafeName(name)) throw new Error('Invalid filename');
};

export { assertSafeName };
