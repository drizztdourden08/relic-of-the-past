/* @layer renderer-components @kind component */
/**
 * Per-key control renderer + disabled rules for the Audio settings tab.
 *
 * The pack format, the output rate, the channel count and the buffer are all technical values
 * with one correct answer per pack, so in Auto they are shown as derived and locked; Manual
 * unlocks every one of them and adds the warning that says when a combination is wrong.
 */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { MsuPackProfile } from '@shared/features/msu-auto-config';
import { resolveAudioConfig, detectMsuMismatch } from '@shared/features/msu-auto-config';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { Slider } from '../../../../../design-system/primitives/Slider';
import { MsuDetectedSummary } from './MsuDetectedSummary';
import { MsuMismatchCallout } from './MsuMismatchCallout';
import { renderVolumeSlider } from './audio-volume-sliders';

const CHANNEL_OPTIONS = [
  { value: '1', label: 'Mono' },
  { value: '2', label: 'Stereo' },
];

const FREQ_OPTIONS = [
  { value: '22050', label: '22050' },
  { value: '32000', label: '32000' },
  { value: '44100', label: '44100' },
  { value: '48000', label: '48000' },
];

/** Every pack shape: the four distributed formats, our layered one, and off. */
const MSU_OPTIONS = [
  { value: 'false', label: 'Off' },
  { value: 'true', label: 'MSU' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'opuz', label: 'OPUZ' },
  { value: 'deluxe-opuz', label: 'Deluxe OPUZ' },
  { value: 'msul', label: 'MSUL' },
];

const MODE_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'manual', label: 'Manual' },
];

const BUFFER_STEPS = [512, 1024, 2048, 4096];

const bufferToStep = (val: number): number => {
  const idx = BUFFER_STEPS.indexOf(val);
  return idx >= 0 ? idx : 2;
};

const stepToBuffer = (step: number): number => {
  return BUFFER_STEPS[step] ?? 2048;
};

/** Note appended to a control whose value Auto is choosing, so a locked row explains itself. */
const AUTO_NOTE = 'Set automatically from the assigned pack — switch Configuration to Manual to change it.';

const renderControl = (
  key: string,
  settings: GameSettings,
  onChange: (patch: Partial<GameSettings>) => void,
  pack?: MsuPackProfile | null,
): ReactNode | null => {
  const auto = settings.msuConfigMode === 'auto';
  // What will actually be used, so a locked control shows the real value rather than a stale one.
  const resolved = resolveAudioConfig(settings, pack ?? null);

  // Master, Music, Ambience and SFX are plain sliders with one shape — they render in their own file.
  const volumeSlider = renderVolumeSlider(key, settings, onChange);
  if (volumeSlider) return volumeSlider;

  switch (key) {
    case 'audioFreq':
      return (
        <>
          <SegmentedControl
            label="Sample Rate"
            description={auto
              ? `MSU packs are 44100 Hz, OPUZ packs 48000 Hz. ${AUTO_NOTE}`
              : 'Must match the pack format: 44100 Hz for MSU/Deluxe, 48000 Hz for OPUZ/Deluxe OPUZ.'}
            value={String(resolved.audioFreq)}
            options={FREQ_OPTIONS}
            onChange={(v) => onChange({ audioFreq: Number(v) })}
            disabled={auto || settings.vanillaSafe}
          />
          {detectMsuMismatch(settings) && <MsuMismatchCallout message={detectMsuMismatch(settings)!} />}
        </>
      );
    case 'audioChannels':
      return (
        <SegmentedControl
          label="Channels"
          description={auto
            ? `Replacement music is always stereo. ${AUTO_NOTE}`
            : 'Mono collapses the output to one channel; Stereo keeps left and right separate'}
          value={String(resolved.audioChannels)}
          options={CHANNEL_OPTIONS}
          onChange={(v) => onChange({ audioChannels: Number(v) as 1 | 2 })}
          disabled={auto || settings.vanillaSafe}
        />
      );
    case 'audioSamples':
      return (
        <Slider
          label="Buffer Size"
          description={auto
            ? `Left at a value that is stable on most machines. ${AUTO_NOTE}`
            : 'Smaller buffers reduce latency but may crackle; larger ones are steadier but add delay.'}
          value={bufferToStep(resolved.audioSamples)}
          min={0}
          max={3}
          step={1}
          onChange={(step) => onChange({ audioSamples: stepToBuffer(step) })}
          formatValue={(step) => `${BUFFER_STEPS[step]}`}
          disabled={auto || settings.vanillaSafe}
        />
      );
    case 'msuConfigMode':
      return (
        <SegmentedControl
          label="Configuration"
          description="Auto reads the pack assigned to this profile and sets the format, sample rate, channels and buffer to match — there is only one right answer and nothing to match up by hand. Manual unlocks all of them."
          value={settings.msuConfigMode}
          options={MODE_OPTIONS}
          onChange={(v) => onChange({ msuConfigMode: v as GameSettings['msuConfigMode'] })}
          disabled={settings.vanillaSafe}
        />
      );
    case 'enableMSU': {
      if (auto) return <MsuDetectedSummary pack={pack ?? null} resolved={resolved} />;
      return (
        <SegmentedControl
          label="Pack Format"
          description="Which format the assigned pack is. Deluxe adds the extended per-area tracks, OPUZ variants are Opus-compressed, and MSUL is a layered pack whose manifest decides what each slot plays. Packs are imported and assigned in the Data Manager."
          value={settings.enableMSU}
          options={MSU_OPTIONS}
          onChange={(v) => onChange({ enableMSU: v as GameSettings['enableMSU'] })}
          // Replacement music has no gate-word bit of its own — Vanilla Safe suppresses it in the
          // playback plan regardless of this control, so lock it the way a registered feature is.
          disabled={settings.vanillaSafe}
        />
      );
    }
    default:
      return null;
  }
};

/** The switches that only mean something while a pack is playing at all. */
const PACK_DEPENDENT_KEYS = ['resumeMSU', 'resetMSUAtTitle', 'packReplaceAmbient', 'packReplaceSfx'];

const isDisabled = (key: string, settings: GameSettings): boolean => {
  // Only Manual mode's own switch can turn these off: in Auto, whether a pack plays is decided
  // by the pack being assigned, so a stale `enableMSU` from a profile saved before that change
  // must not grey them out.
  if (PACK_DEPENDENT_KEYS.includes(key)) {
    if (settings.vanillaSafe) return true;
    return settings.msuConfigMode === 'manual' && settings.enableMSU === 'false';
  }
  // The Music/Ambience/SFX sliders only do anything once the independent-mix toggle is on.
  if (key === 'musicVolume' || key === 'ambientVolume' || key === 'sfxVolume') return !settings.perGroupVolume;
  return false;
};

export { renderControl, isDisabled };
