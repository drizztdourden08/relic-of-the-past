/* @layer renderer-lib @kind types */
// The Strategy seam for layer playback: each play mode is one scheduler.
import type { LayerResume } from '@shared/types/msu-manifest';
import type { Voice, VoiceFade, VoiceOptions } from '../voice';
import type { DecodedAudio } from '../decode/decode-audio-file';

/** What a scheduler is allowed to do to the audio graph. The engine supplies it. */
interface LayerContext {
  /** Decoded files for this layer, in manifest order. */
  files: DecodedAudio[];
  /** Names for the same files, so a scheduler can report what it is sounding. */
  fileNames: string[];
  /** Start a voice on the layer's own gain node. Fades are per-voice, so passes can overlap. */
  play: (fileIndex: number, options: VoiceOptions) => Voice;
  /** Seconds since the track started. `interval` mode measures against this clock. */
  elapsedSeconds: () => number;
  /**
   * Where each repeat of this layer starts, in seconds; 0 repeats the whole file. From the
   * manifest loop point, or the file's own. Zero unless the layer has exactly one file (a pool
   * restarts each file from its top, same as the exporter).
   */
  loopSeconds: number;
}

/** One sound this layer has audible right now. A layer can have several at once. */
interface SoundingVoice {
  fileName: string | null;
  positionSeconds: number;
  durationSeconds: number;
  /** Where this sound repeats from, when it loops from somewhere other than the start. */
  loopSeconds: number | null;
  /** Set while this sound is crossfading, so the overlap is visible as it happens. */
  fade: VoiceFade | null;
}

/** What a layer is doing right now, for the studio's live preview. Everything is optional because the modes differ. */
interface LayerActivity {
  /** Sounding now, or the most recent one for modes that fire and fall silent. */
  fileName: string | null;
  /** Seconds until the next sound, for modes that wait between sounds. */
  nextEventInSeconds: number | null;
  /** The full gap this countdown began from. A progress bar needs it as the denominator. */
  waitSeconds: number | null;
  /** Position within what is sounding, for continuous modes. */
  positionSeconds: number | null;
  durationSeconds: number | null;
  /** True while something from this layer is audible. */
  sounding: boolean;
  /** How many of this layer's sounds are audible at once. Above one means overlap, which random mode allows when a sound outlasts its gap. */
  voiceCount: number;
  /** Every sound audible right now, oldest first; the preview gives each its own row. */
  voices: SoundingVoice[];
}

interface LayerScheduler {
  /** Begin playing. A resume snapshot, when given, says where to pick up. */
  start: (resume: LayerResume | null) => void;
  /** Where playback is right now, without disturbing it; what a save-state snapshot reads. */
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
