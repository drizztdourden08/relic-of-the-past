/* @layer renderer-components @kind logic */
import { shortName } from './shortName';
import { FADE_MARK, UNKNOWN_NAME } from './voiceCaptions.constants';
import type { ReportedVoice, VoiceCaption } from '../PreviewReadout.type';

const countByName = (voices: ReportedVoice[]): Map<string, number> => {
  const counts = new Map<string, number>();
  voices.forEach((voice) => {
    const name = voice.fileName ?? UNKNOWN_NAME;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });
  return counts;
};

const voiceCaptions = (voices: ReportedVoice[]): VoiceCaption[] => {
  const counts = countByName(voices);
  const seen = new Map<string, number>();

  return voices.map((voice) => {
    const name = voice.fileName ?? UNKNOWN_NAME;
    const nth = (seen.get(name) ?? 0) + 1;
    seen.set(name, nth);
    const repeated = (counts.get(name) ?? 0) > 1;
    const mark = !repeated ? '' : voice.fade !== null ? ` ${FADE_MARK[voice.fade.kind]}` : ` #${nth}`;
    return { caption: `${shortName(name)}${mark}`, title: voice.fileName };
  });
};

export { voiceCaptions };
