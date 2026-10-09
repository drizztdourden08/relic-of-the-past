/* @layer renderer-lib @kind logic */
import { msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const getMsuTrackList = (pack: string) => msu.getTrackList(platformFiles(), pack);

export { getMsuTrackList };
