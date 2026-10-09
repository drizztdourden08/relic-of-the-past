/* @layer shared-storage @kind logic */
import { containerExtension } from './container-extension';
import { spriteStem } from './sprite-stem';

const safeFileName = (name: string): string => {
  const ext = containerExtension(name);
  const base = spriteStem(name).replace(/[^\w.-]+/g, '_') || 'sprite';
  return `${base}.${ext}`;
};

export { safeFileName };
