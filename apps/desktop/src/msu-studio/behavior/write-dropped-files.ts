/* @layer renderer-components @kind logic */
import * as msuStore from '@app/storage/msu-store';
import { parkFile } from './park-file';
import { canonicalTrackName, extensionOf, sanitizeFileName, uniqueFileName } from './track-file-name';
import { getTrackNumber } from './get-track-number';
import type { WriteDroppedParams } from './write-dropped-files.type';

const parkOccupant = async (pack: string, name: string, trackNum: number, taken: Set<string>): Promise<void> => {
  const occupant = [...taken].find((n) => n !== name && getTrackNumber(n) === trackNum);
  if (occupant) await parkFile(pack, occupant, taken);
};

const writeDroppedFiles = async (params: WriteDroppedParams): Promise<string[]> => {
  const { pack, trackNum, dropped, format, taken, prefix, onCopied } = params;
  const written: string[] = [];
  for (const [index, file] of dropped.entries()) {
    const claimsSlot = index === 0 && format === 'classic';
    const name = claimsSlot
      ? canonicalTrackName(prefix, trackNum, extensionOf(file.name))
      : uniqueFileName(sanitizeFileName(file.name), taken);
    if (claimsSlot) await parkOccupant(pack, name, trackNum, taken);
    await msuStore.writeMsuTrackFile(pack, name, await file.arrayBuffer());
    taken.add(name);
    written.push(name);
    onCopied(index + 1, dropped.length);
  }
  return written;
};

export { writeDroppedFiles };
