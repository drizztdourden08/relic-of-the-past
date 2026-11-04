/* @layer renderer-lib @kind logic */
import { alttpMsuConfig, msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const renameMsuTrackFile = (pack: string, from: string, to: string) => msu.renameTrackFile(alttpMsuConfig, platformFiles(), pack, { from, to });

export { renameMsuTrackFile };
