/* @layer renderer-lib @kind types */
import type { LayerResume } from '@rotp/game-data';
import type { Voice, VoiceFade, VoiceOptions } from '../voice';
import type { DecodedAudio } from '../decode/decode-audio-file';

interface LayerContext {
  files: DecodedAudio[];
  fileNames: string[];
  play: (fileIndex: number, options: VoiceOptions) => Voice;
  elapsedSeconds: () => number;
  loopSeconds: number;
}

interface SoundingVoice {
  fileName: string | null;
  positionSeconds: number;
  durationSeconds: number;
  loopSeconds: number | null;
  fade: VoiceFade | null;
}

interface LayerActivity {
  fileName: string | null;
  nextEventInSeconds: number | null;
  waitSeconds: number | null;
  positionSeconds: number | null;
  durationSeconds: number | null;
  sounding: boolean;
  voiceCount: number;
  voices: SoundingVoice[];
}

interface LayerScheduler {
  start: (resume: LayerResume | null) => void;
  position: () => LayerResume;
  activity: () => LayerActivity;
  stop: () => void;
}

type LiveVoice = { voice: Voice; fileIndex: number };

export type { LayerContext, LayerScheduler, LayerActivity, SoundingVoice, LiveVoice };
