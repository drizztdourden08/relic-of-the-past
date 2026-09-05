/* @layer renderer-components @kind logic */
// Moves a file out of the numbered range instead of deleting it, so clearing a slot destroys nothing.
import { renameMsuTrackFile } from '@app/lib/storage/msu-store';
import { extensionOf, stemOf, uniqueFileName } from './track-file-name';

const parkFile = async (pack: string, fileName: string, taken: Set<string>): Promise<string> => {
  const parked = uniqueFileName(`${stemOf(fileName)}-unused.${extensionOf(fileName)}`, taken);
  await renameMsuTrackFile(pack, fileName, parked);
  taken.add(parked);
  taken.delete(fileName);
  return parked;
};

export { parkFile };
