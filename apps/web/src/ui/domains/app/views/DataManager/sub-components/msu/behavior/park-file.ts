/* @layer renderer-components @kind logic */
/**
 * Moves a file out of the numbered range instead of deleting it.
 *
 * Clearing a slot, or dropping new audio onto an occupied one, would otherwise destroy audio
 * the user may have spent a long time getting into the pack. Renaming it to a name no slot can
 * claim leaves it in the pack, visible and reassignable, and costs nothing.
 */
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
