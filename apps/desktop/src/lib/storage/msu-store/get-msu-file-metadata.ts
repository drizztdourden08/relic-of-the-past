/* @layer renderer-lib @kind logic */
import { msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';
import { probeAudioFile } from '../audio-probe';

const getMsuFileMetadata = (pack: string) => msu.packFileMetadata(platformFiles(), pack, probeAudioFile);

export { getMsuFileMetadata };
