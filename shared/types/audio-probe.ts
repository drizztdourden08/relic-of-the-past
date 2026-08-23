/* @layer shared-types @kind logic */
/**
 * What a decoder can report about one audio file. Every field is nullable because
 * the probe is optional: without a decoder present nothing here is knowable for an
 * encoded file, and the caller keeps the nulls rather than guessing.
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
 * Probes one file, addressed by its POSIX path relative to the Data root. Resolves null
 * whenever nothing can be read — no decoder installed, not a media file, probe failed —
 * so a caller treats an absent probe and a failed one identically.
 */
type AudioProbe = (dataPath: string) => Promise<ProbedAudio | null>;

export type { AudioProbe, ProbedAudio };
