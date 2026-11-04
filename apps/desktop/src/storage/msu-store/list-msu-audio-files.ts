/* @layer renderer-lib @kind logic */
import { alttpMsuConfig, msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const listMsuAudioFiles = (pack: string) => msu.listAudioFiles(alttpMsuConfig, platformFiles(), pack);

export { listMsuAudioFiles };
