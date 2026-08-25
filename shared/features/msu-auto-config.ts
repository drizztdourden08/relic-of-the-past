/* @layer shared-features @kind logic */
/**
 * Works out the whole technical side of a music pack from the pack itself.
 *
 * Packs come in a handful of shapes — standard or extended track numbering, raw PCM or
 * Opus-compressed, and our own layered format — and each has exactly one correct set of values:
 * the format, the output sample rate, the channel count. Getting any of them wrong is audible (a
 * rate that disagrees with the audio plays it at the wrong speed), and there is no judgement
 * involved, so Auto reads them off the files and Manual is only there to override.
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
   * Carries a `pack.json`, so slots can stack several scheduled layers instead of one file. This
   * is the defining property of a pack that has it — it says how playback works, where the other
   * two only describe the audio — so it is what the format is reported as.
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
 * The format that matches a pack's shape. A layered pack reports as `msul` regardless of what
 * its audio happens to be, because the manifest is what governs playback; its track numbering
 * still applies on top and is carried separately (see `resolveMsuPlayback`).
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

/**
 * The sample rate a format's audio actually is, or null when there is no single answer: off, or
 * a layered pack, whose files may be any mixture of formats and are each resampled anyway.
 */
const requiredSampleRate = (mode: GameSettings['enableMSU']): number | null => {
  if (mode === 'false' || mode === 'msul') return null;
  return mode === 'opuz' || mode === 'deluxe-opuz' ? OPUS_SAMPLE_RATE : PCM_SAMPLE_RATE;
};

/**
 * In Auto every technical value is derived: the mode from the pack's shape, the rate from its
 * audio format, stereo because MSU audio always is, and the buffer left at a safe default since
 * it depends on the machine rather than the pack. Manual passes the user's own values straight
 * through, including a wrong combination — `detectMsuMismatch` is what warns them about it.
 * Vanilla Safe suppresses replacement music entirely, as it always has.
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
 * A human-readable warning when manual settings disagree with what the chosen mode's audio
 * actually is — the condition the old C player only ever reported to stderr. Null when the
 * settings are consistent, when replacement music is off, or in Auto (which cannot disagree).
 */
const detectMsuMismatch = (settings: GameSettings): string | null => {
  if (settings.msuConfigMode === 'auto' || settings.vanillaSafe) return null;
  const required = requiredSampleRate(settings.enableMSU);
  if (required === null || settings.audioFreq === required) return null;
  return `${settings.enableMSU} packs are ${required} Hz — the output is set to ${settings.audioFreq} Hz, which plays them at the wrong speed.`;
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
