/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { shortName } from './short-name';
import { UNKNOWN_NAME } from './voice-captions.constants';
import type { ReportedVoice, VoiceCaption } from '../PreviewReadout.type';

const countByName = (voices: ReportedVoice[]): Map<string, number> => {
  const counts = new Map<string, number>();
  voices.forEach((voice) => {
    const name = voice.fileName ?? UNKNOWN_NAME;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });
  return counts;
};

const captionOf = (t: I18n['t'], voice: ReportedVoice, name: string, nth: number): string => {
  if (voice.fade !== null) {
    const key = voice.fade.kind === 'in' ? 'msu-studio:meter.caption.fade-in' : 'msu-studio:meter.caption.fade-out';
    return t(key, { name });
  }
  return t('msu-studio:meter.caption.repeat', { name, number: nth });
};

const voiceCaptions = (t: I18n['t'], voices: ReportedVoice[]): VoiceCaption[] => {
  const counts = countByName(voices);
  const seen = new Map<string, number>();

  return voices.map((voice) => {
    const name = voice.fileName ?? UNKNOWN_NAME;
    const nth = (seen.get(name) ?? 0) + 1;
    seen.set(name, nth);
    const repeated = (counts.get(name) ?? 0) > 1;
    const short = shortName(name);
    return { caption: repeated ? captionOf(t, voice, short, nth) : short, title: voice.fileName };
  });
};

export { voiceCaptions };
