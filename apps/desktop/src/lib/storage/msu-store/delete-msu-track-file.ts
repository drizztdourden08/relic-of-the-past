/* @layer renderer-lib @kind logic */
import { msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const deleteMsuTrackFile = (pack: string, fileName: string) => msu.deleteTrackFile(platformFiles(), pack, fileName);

export { deleteMsuTrackFile };
