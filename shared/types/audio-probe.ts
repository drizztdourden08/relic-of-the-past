/* @layer shared-types @kind logic */
/**
 * What a decoder can report about one audio file. Every field is nullable because the probe is
 * optional: without a decoder nothing is knowable for an encoded file, and nulls are not guessed.
 */

interface ProbedAudio {
  /** Seconds of audio. */
  durationSeconds: number | null;
  /** Hz. */
  sampleRate: number | null;
  channels: number | null;
  /** Bits per second. */
  bitRate: number | null;
}

/**
 * Probes one file by POSIX path relative to the Data root. Resolves null whenever nothing can be
 * read (no decoder, not a media file, probe failed), so an absent probe and a failed one look alike.
 */
type AudioProbe = (dataPath: string) => Promise<ProbedAudio | null>;

export type { AudioProbe, ProbedAudio };
