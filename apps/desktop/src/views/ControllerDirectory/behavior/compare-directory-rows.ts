/* @layer renderer-components @kind logic */
import type { DirectoryRow } from '../ControllerDirectory.type';

const compareDirectoryRows = (a: DirectoryRow, b: DirectoryRow): number => {
  if (a.group !== b.group) return a.group === 'Connected' ? -1 : 1;
  return a.name.localeCompare(b.name);
};

export { compareDirectoryRows };
