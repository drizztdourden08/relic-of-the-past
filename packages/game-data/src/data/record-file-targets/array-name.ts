/* @layer shared-game @kind logic */
import { ARRAY_SUFFIX, EVENTS_FOLDER } from './array-name.constants';

const recordArrayName = (relativePath: string): string | null => {
  if (relativePath.startsWith(EVENTS_FOLDER)) return null;
  const parts = relativePath.replace(/\.ts$/, '').split('/');
  const collection = parts.shift() as string;
  let suffix = ARRAY_SUFFIX[collection];
  if (!suffix) return null;
  if (parts[0] === 'dungeon-items') {
    parts.shift();
    suffix = 'DUNGEON_ITEMS';
  }
  const prefix = parts[0] === 'light-world' || parts[0] === 'dark-world'
    ? `${parts.shift() === 'light-world' ? 'LW' : 'DW'}_`
    : '';
  const place = parts.join('_').replace(/-/g, '_').toUpperCase();
  return `${prefix}${place ? `${place}_` : ''}${suffix}`;
};

export { recordArrayName };
