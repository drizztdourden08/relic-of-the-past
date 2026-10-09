/* @layer renderer-lib @kind logic */
import { msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const listMsuAudioFiles = (pack: string) => msu.listAudioFiles(platformFiles(), pack);

export { listMsuAudioFiles };
