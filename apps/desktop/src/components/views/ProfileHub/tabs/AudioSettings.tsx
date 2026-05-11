import type { GameSettings } from '@shared/types/settings';
import { Toggle } from '../../../primitives/Toggle';
import { SegmentedControl } from '../../../primitives/SegmentedControl';
import { Slider } from '../../../primitives/Slider';
import { SettingsSection } from '../../../composites/SettingsSection';

interface AudioSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

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

const MSU_OPTIONS = [
  { value: 'false', label: 'Off' },
  { value: 'true', label: 'MSU' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'opuz', label: 'OPUZ' },
  { value: 'deluxe-opuz', label: 'Deluxe OPUZ' },
];

const BUFFER_STEPS = [512, 1024, 2048, 4096];

function bufferToStep(val: number): number {
  const idx = BUFFER_STEPS.indexOf(val);
  return idx >= 0 ? idx : 2; // default to 2048
}

function stepToBuffer(step: number): number {
  return BUFFER_STEPS[step] ?? 2048;
}

export function AudioSettings({ settings, onChange }: AudioSettingsProps) {
  return (
    <div className="settings-tab">
      <SettingsSection title="Playback">
        <Toggle
          label="Enable Audio"
          description="Master audio switch"
          checked={settings.enableAudio}
          onChange={(v) => onChange({ enableAudio: v })}
        />
        <SegmentedControl
          label="Channels"
          value={String(settings.audioChannels)}
          options={CHANNEL_OPTIONS}
          onChange={(v) => onChange({ audioChannels: Number(v) as 1 | 2 })}
          disabled={!settings.enableAudio}
        />
        <SegmentedControl
          label="Sample Rate"
          value={String(settings.audioFreq)}
          options={FREQ_OPTIONS}
          onChange={(v) => onChange({ audioFreq: Number(v) })}
          disabled={!settings.enableAudio}
        />
        <Slider
          label="Buffer Size"
          description="Higher = more latency, less crackle"
          value={bufferToStep(settings.audioSamples)}
          min={0}
          max={3}
          step={1}
          onChange={(step) => onChange({ audioSamples: stepToBuffer(step) })}
          formatValue={(step) => `${BUFFER_STEPS[step]}`}
          disabled={!settings.enableAudio}
        />
      </SettingsSection>

      <SettingsSection title="MSU Audio">
        <SegmentedControl
          label="MSU Mode"
          value={settings.enableMSU}
          options={MSU_OPTIONS}
          onChange={(v) => onChange({ enableMSU: v as GameSettings['enableMSU'] })}
          disabled={!settings.enableAudio}
        />
        <Toggle
          label="Resume MSU"
          description="Remember position when re-entering an area"
          checked={settings.resumeMSU}
          onChange={(v) => onChange({ resumeMSU: v })}
          disabled={!settings.enableAudio || settings.enableMSU === 'false'}
        />
        <Slider
          label="MSU Volume"
          value={settings.msuVolume}
          min={0}
          max={100}
          step={5}
          onChange={(v) => onChange({ msuVolume: v })}
          formatValue={(v) => `${v}%`}
          disabled={!settings.enableAudio || settings.enableMSU === 'false'}
        />
      </SettingsSection>
    </div>
  );
}
