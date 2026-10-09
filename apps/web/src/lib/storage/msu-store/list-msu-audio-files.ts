/* @layer renderer-lib @kind logic */
import * as msu from '@shared/storage/msu';
import { platformFiles } from '../platform-files';

const listMsuAudioFiles = (pack: string) => msu.listAudioFiles(platformFiles(), pack);

export { listMsuAudioFiles };
