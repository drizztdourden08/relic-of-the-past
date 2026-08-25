/* @layer renderer-lib @kind types */
/**
 * The Strategy seam for layer playback. Each play mode is one scheduler; the engine starts
 * and stops them without knowing how any of them keeps time.
 */
import type { LayerResume } from '@shared/types/msu-manifest';
import type { Voice, VoiceFade, VoiceOptions } from '../voice';
import type { DecodedAudio } from '../decode/decode-audio-file';

/** What a scheduler is allowed to do to the audio graph — supplied by the engine. */
interface LayerContext {
  /** Decoded files for this layer, in manifest order. */
  files: DecodedAudio[];
  /** Names for the same files, so a scheduler can report what it is sounding. */
  fileNames: string[];
  /** Start a voice on the layer's own gain node. Fades are per-voice, so passes can overlap. */
  play: (fileIndex: number, options: VoiceOptions) => Voice;
  /** Seconds since the track started — the clock `interval` mode measures against. */
  elapsedSeconds: () => number;
  /**
   * Where each repeat of this layer starts, in seconds; 0 repeats the whole file. Taken from the
   * layer's manifest loop point, or the file's own when it declared one. Zero unless the layer has
   * exactly one file — a pool restarts each file from its top, the same rule the exporter applies.
   */
  loopSeconds: number;
}

/** One sound this layer has audible right now — a layer can have several at once. */
interface SoundingVoice {
  fileName: string | null;
  positionSeconds: number;
  durationSeconds: number;
  /** Where this sound repeats from, when it loops from somewhere other than the start. */
  loopSeconds: number | null;
  /** Set while this sound is crossfading, so the overlap is visible as it happens. */
  fade: VoiceFade | null;
}

/**
 * What a layer is doing right now, for the studio's live preview. Everything is optional
 * because the modes differ: a loop has a position in a file, a random one-shot has a wait.
 */
interface LayerActivity {
  /** Sounding now, or the most recent one for modes that fire and fall silent. */
  fileName: string | null;
  /** Seconds until the next sound, for modes that wait between sounds. */
  nextEventInSeconds: number | null;
  /** The full gap this countdown began from — the denominator a progress bar needs. */
  waitSeconds: number | null;
  /** Position within what is sounding, for continuous modes. */
  positionSeconds: number | null;
  durationSeconds: number | null;
  /** True while something from this layer is audible. */
  sounding: boolean;
  /**
   * How many of this layer's sounds are audible at once. Above one means they are overlapping,
   * which the random mode allows on purpose when a sound outlasts its gap.
   */
  voiceCount: number;
  /**
   * Every sound audible right now, oldest first. The preview gives each its own row, which is
   * how overlapping random hits and a loop's crossfade both become legible.
   */
  voices: SoundingVoice[];
}

interface LayerScheduler {
  /** Begin playing. A resume snapshot, when given, says where to pick up. */
  start: (resume: LayerResume | null) => void;
  /**
   * Where playback is right now, without disturbing it — this is what a save-state snapshot
   * reads, since saving must not interrupt the music.
   */
  position: () => LayerResume;
  /** A human-facing view of the same state, for the preview visualization. */
  activity: () => LayerActivity;
  /** Silence everything and release the nodes. */
  stop: () => void;
}

const EMPTY_RESUME: LayerResume = { fileIndex: 0, offsetSeconds: 0, nextEventInSeconds: null };
const IDLE_ACTIVITY: LayerActivity = {
  fileName: null, nextEventInSeconds: null, waitSeconds: null,
  positionSeconds: null, durationSeconds: null, sounding: false, voiceCount: 0, voices: [],
};

export { EMPTY_RESUME, IDLE_ACTIVITY };
export type { LayerContext, LayerScheduler, LayerActivity, SoundingVoice };
