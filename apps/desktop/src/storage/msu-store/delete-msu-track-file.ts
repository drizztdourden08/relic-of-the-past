/* @layer renderer-lib @kind logic */
import { alttpMsuConfig, msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const deleteMsuTrackFile = (pack: string, fileName: string) => msu.deleteTrackFile(alttpMsuConfig, platformFiles(), pack, fileName);

export { deleteMsuTrackFile };
