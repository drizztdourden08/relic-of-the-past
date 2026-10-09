/* @layer shared-storage @kind logic */
import { AUDIO_RE } from './msu-paths.constants';

const isAudioFile = (name: string): boolean => AUDIO_RE.test(name);

export { isAudioFile };
