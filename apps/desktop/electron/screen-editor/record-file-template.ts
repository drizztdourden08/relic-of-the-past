/* @layer electron-main @kind logic */
/**
 * The empty record file a create starts when the tree holds none for that path yet.
 *
 * The layout files a record by its world, its area or its dungeon and floor, so a
 * destination can be a file nobody has needed yet: the first interior of an area, or
 * a dungeon, which is one record in one file. The array is named by the same rule
 * every other file of its collection follows (record-file-targets.ts), so the
 * loader's glob picks the new file up like any other.
 */

import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { recordArrayName } from '@shared/game/data/record-file-targets';

const emptyRecordFile = (relativePath: string, recordType: string): string | null => {
  const name = recordArrayName(relativePath);
  if (!name) return null;
  return '/* @layer shared-game @kind data */\n'
    + `import type { ${recordType} } from '@shared/game/data/types';\n\n`
    + `const ${name}: ${recordType}[] = [\n];\n\nexport { ${name} };\n`;
};

/** Writes the empty file when the destination is absent. Returns an error message, or null. */
const startRecordFile = async (
  path: string,
  relativePath: string,
  recordType: string,
): Promise<string | null> => {
  try {
    await readFile(path, 'utf-8');
    return null;
  } catch {
    const contents = emptyRecordFile(relativePath, recordType);
    if (!contents) return `No file could be started for ${relativePath}`;
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, contents, 'utf-8');
    return null;
  }
};

export { emptyRecordFile, startRecordFile };
