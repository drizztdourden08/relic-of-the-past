/* @layer shared-features @kind logic */
/**
 * Works out the technical side of a music pack from the pack itself. Each pack shape (standard
 * or extended numbering, PCM or Opus, our layered format) has exactly one correct format, sample
 * rate and channel count, and a wrong one is audible. Auto reads them off the files; Manual overrides.
 */
import type { GameSettings } from '@shared/types/settings';
import { DELUXE_TRACK_THRESHOLD } from '@shared/types/msu-manifest';

interface MsuTrackInfo {
  trackNum: number;
  ext: string;
}

interface MsuPackProfile {
  /** Carries tracks beyond the vanilla music slots, so the extended remap applies. */
  isDeluxe: boolean;
  /** Holds Opus-compressed audio, which is 48 kHz where raw PCM is 44.1 kHz. */
  hasOpuz: boolean;
  /**
   * Carries a `pack.json`, so slots can stack scheduled layers instead of one file. This decides
   * how playback works (the other two only describe the audio), so it is the reported format.
   */
  isLayered: boolean;
}

interface ResolvedAudioConfig {
  enableMSU: GameSettings['enableMSU'];
  audioFreq: number;
  audioChannels: 1 | 2;
  audioSamples: number;
}

/** Native rates of the two audio formats a pack can hold. */
const PCM_SAMPLE_RATE = 44100;
const OPUS_SAMPLE_RATE = 48000;
/** Latency/stability middle ground; unlike the others this is a host trait, not a pack one. */
const DEFAULT_BUFFER = 2048;

/** `isLayered` comes from the manifest existing, which the caller has already looked up. */
const detectMsuPackProfile = (tracks: MsuTrackInfo[], isLayered = false): MsuPackProfile => ({
  isDeluxe: tracks.some((t) => t.trackNum >= DELUXE_TRACK_THRESHOLD),
  hasOpuz: tracks.some((t) => t.ext === 'opuz'),
  isLayered,
});

/**
 * The format matching a pack's shape. A layered pack reports as `msul` whatever its audio is,
 * because the manifest governs playback; track numbering is carried separately (`resolveMsuPlayback`).
 */
const modeForPack = (pack: MsuPackProfile): GameSettings['enableMSU'] => {
  if (pack.isLayered) return 'msul';
  if (pack.isDeluxe && pack.hasOpuz) return 'deluxe-opuz';
  if (pack.isDeluxe) return 'deluxe';
  if (pack.hasOpuz) return 'opuz';
  return 'true';
};

/** True for the modes that use the extended per-area/per-entrance track numbering. */
const isDeluxeMode = (mode: GameSettings['enableMSU']): boolean =>
  mode === 'deluxe' || mode === 'deluxe-opuz';

/** The sample rate a format's audio is, or null when there is no single answer (off, or a layered pack whose files are resampled anyway). */
const requiredSampleRate = (mode: GameSettings['enableMSU']): number | null => {
  if (mode === 'false' || mode === 'msul') return null;
  return mode === 'opuz' || mode === 'deluxe-opuz' ? OPUS_SAMPLE_RATE : PCM_SAMPLE_RATE;
};

/**
 * Auto derives everything: mode from the pack's shape, rate from its audio format, stereo (MSU
 * always is), buffer at a safe default since it depends on the machine, not the pack. Manual
 * passes the user's values through, wrong combinations included (`detectMsuMismatch` warns).
 * Vanilla Safe suppresses replacement music entirely.
 */
const resolveAudioConfig = (settings: GameSettings, pack: MsuPackProfile | null): ResolvedAudioConfig => {
  const asIs: ResolvedAudioConfig = {
    enableMSU: settings.enableMSU,
    audioFreq: settings.audioFreq,
    audioChannels: settings.audioChannels,
    audioSamples: settings.audioSamples,
  };
  if (settings.msuConfigMode === 'manual') return asIs;
  if (settings.vanillaSafe || !pack) return { ...asIs, enableMSU: 'false' };

  return {
    enableMSU: modeForPack(pack),
    audioFreq: pack.hasOpuz ? OPUS_SAMPLE_RATE : PCM_SAMPLE_RATE,
    audioChannels: 2,
    audioSamples: DEFAULT_BUFFER,
  };
};

/**
 * A human-readable warning when manual settings disagree with the chosen mode's audio (the old
 * C player only reported this to stderr). Null when consistent, off, or in Auto.
 */
const detectMsuMismatch = (settings: GameSettings): string | null => {
  if (settings.msuConfigMode === 'auto' || settings.vanillaSafe) return null;
  const required = requiredSampleRate(settings.enableMSU);
  if (required === null || settings.audioFreq === required) return null;
  return `${settings.enableMSU} packs are ${required} Hz, but the output is set to ${settings.audioFreq} Hz, which plays them at the wrong speed.`;
};

/** Whether replacement music plays at all, and in which numbering, once everything is resolved. */
const resolveMsuPlayback = (settings: GameSettings, pack: MsuPackProfile | null) => {
  const resolved = resolveAudioConfig(settings, pack);
  return {
    enabled: !settings.vanillaSafe && !!pack && resolved.enableMSU !== 'false',
    // Read off the pack's own track numbers when we have them: a layered pack reports as `msul`
    // but can still contain the extended slots, and dropping the remap would silence them.
    isDeluxe: pack?.isDeluxe ?? isDeluxeMode(resolved.enableMSU),
    resolved,
  };
};

export {
  detectMsuPackProfile, resolveAudioConfig, resolveMsuPlayback,
  detectMsuMismatch, modeForPack, isDeluxeMode, requiredSampleRate,
};
export type { MsuTrackInfo, MsuPackProfile, ResolvedAudioConfig };
