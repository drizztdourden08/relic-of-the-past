/* @layer shared-game @kind logic */
import type { TagKeyParts } from './tags.type';
import { SEPARATOR } from './tags.constants';

const splitTagKey = (key: string): TagKeyParts | null => {
  const at = key.indexOf(SEPARATOR);
  if (at <= 0 || at >= key.length - 1) return null;
  return { namespace: key.slice(0, at), value: key.slice(at + 1) };
};

export { splitTagKey };
