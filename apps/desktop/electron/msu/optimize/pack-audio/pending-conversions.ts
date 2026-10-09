/* @layer electron-main @kind logic */
import { supersededMap } from '@rotp/msu';
import { isTargetFormat } from './is-target-format';
import type { PackAudioFile } from './pack-audio.type';

const pendingConversions = (audio: PackAudioFile[]): PackAudioFile[] => {
  const covered = supersededMap(audio.map((file) => file.name));
  return audio.filter((file) => !isTargetFormat(file.name) && !covered.has(file.name));
};

export { pendingConversions };
