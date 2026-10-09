/* @layer renderer-lib @kind logic */
import * as msu from '@shared/storage/msu';
import { platformFiles } from '../platform-files';

const getMsuTrackList = (pack: string) => msu.getTrackList(platformFiles(), pack);

export { getMsuTrackList };
