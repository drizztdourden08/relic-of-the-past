/* @layer renderer-components @kind logic */
/**
 * Names each row of a layer's live readout after the file it is playing.
 *
 * A row is captioned with the file, not with a word for "a sound": with several audible at once
 * the only thing worth reading is WHICH of the pool landed, and a shared caption turns five
 * distinct hits into five identical lines.
 *
 * Long names are shortened from the middle rather than the end, because the tail carries the part
 * that usually differs — a numbered variant and the extension. The full name always travels with
 * the row so it can still be read in full.
 *
 * Two rows CAN legitimately name the same file: a single-file loop crossfades against itself, and
 * a random pool can draw the same hit twice while the first is still sounding. Those rows are
 * marked so the repetition reads as two passes rather than as the same row drawn twice — by fade
 * direction when they are fading, since that is what actually distinguishes them to the ear, and
 * by their order otherwise.
 */
import type { ReportedVoice } from '../PreviewReadout.type';

/** Beyond this the caption is shortened; the readout's caption column is narrow on purpose. */
const MAX_CAPTION = 24;
const HEAD_CHARS = 12;
const TAIL_CHARS = 10;

const UNKNOWN_NAME = '—';

/** What separates two rows of the same file: which way each one is heading. */
const FADE_MARK: Record<'in' | 'out', string> = { in: '↗', out: '↘' };

interface VoiceCaption {
  caption: string;
  /** The full name, kept whenever the caption is not the whole story. */
  title: string | null;
}

const shortName = (name: string): string =>
  (name.length <= MAX_CAPTION ? name : `${name.slice(0, HEAD_CHARS)}…${name.slice(-TAIL_CHARS)}`);

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
