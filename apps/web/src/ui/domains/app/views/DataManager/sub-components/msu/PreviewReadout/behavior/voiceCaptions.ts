/* @layer renderer-components @kind logic */
/**
 * Captions rows by file name, since WHICH of the pool landed is the point. Names are shortened
 * from the middle because the tail (variant number, extension) is what differs. Two rows can name
 * the same file (a loop crossfading against itself, a random pool drawing twice); those are marked
 * by fade direction when fading, by order otherwise.
 */
import type { ReportedVoice } from '../PreviewReadout.type';

/** Beyond this the caption is shortened; the readout's caption column is narrow on purpose. */
const MAX_CAPTION = 24;
const HEAD_CHARS = 12;
const TAIL_CHARS = 10;

const UNKNOWN_NAME = '-';

/** What separates two rows of the same file: which way each one is heading. */
const FADE_MARK: Record<'in' | 'out', string> = { in: '↗', out: '↘' };

interface VoiceCaption {
  caption: string;
  /** The full name, kept whenever the caption is not the whole story. */
  title: string | null;
}

const shortName = (name: string): string =>
  (name.length <= MAX_CAPTION ? name : `${name.slice(0, HEAD_CHARS)}...${name.slice(-TAIL_CHARS)}`);

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

export { shortName, voiceCaptions };
export type { VoiceCaption };
