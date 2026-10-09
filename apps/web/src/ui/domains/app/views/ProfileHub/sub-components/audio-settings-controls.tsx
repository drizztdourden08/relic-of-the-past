/* @layer renderer-components @kind logic */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { MsuPackProfile } from '@shared/features/msu-auto-config';
import { resolveAudioConfig, detectMsuMismatch } from '@shared/features/msu-auto-config';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { Slider } from '../../../../../design-system/primitives/Slider';
import { MsuDetectedSummary } from './MsuDetectedSummary';
import { MsuMismatchCallout } from './MsuMismatchCallout';
import { renderVolumeSlider } from './audio-volume-sliders';
import {
  AUTO_NOTE, BUFFER_STEPS, CHANNEL_OPTIONS, DEFAULT_BUFFER_SIZE, DEFAULT_BUFFER_STEP,
  FREQ_OPTIONS, MODE_OPTIONS, MSU_OPTIONS,
} from './audio-settings-controls.constants';

const bufferToStep = (val: number): number => {
  const idx = BUFFER_STEPS.indexOf(val);
  return idx >= 0 ? idx : DEFAULT_BUFFER_STEP;
};

const stepToBuffer = (step: number): number => {
  return BUFFER_STEPS[step] ?? DEFAULT_BUFFER_SIZE;
};

const renderControl = (
  key: string,
  settings: GameSettings,
  onChange: (patch: Partial<GameSettings>) => void,
  pack?: MsuPackProfile | null,
): ReactNode | null => {
  const auto = settings.msuConfigMode === 'auto';
  const resolved = resolveAudioConfig(settings, pack ?? null);

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
          description="Auto reads the pack assigned to this profile and sets the format, sample rate, channels and buffer to match. There is only one right answer and nothing to match up by hand. Manual unlocks all of them."
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
          disabled={settings.vanillaSafe}
        />
      );
    }
    default:
      return null;
  }
};

export { renderControl };
