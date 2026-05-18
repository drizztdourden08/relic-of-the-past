import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SegmentedControl } from '../../../primitives/SegmentedControl';
import { Slider } from '../../../primitives/Slider';
import { MsuImport } from './MsuImport';
import { SettingsLayout, type Section } from '../../../composites/SettingsLayout/SettingsLayout';

interface AudioSettingsProps {
  profileId: string;
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
  return idx >= 0 ? idx : 2;
}

function stepToBuffer(step: number): number {
  return BUFFER_STEPS[step] ?? 2048;
}

const SECTIONS: Section[] = [
  {
    id: 'volume',
    title: 'Volume',
    subsections: [
      {
        id: 'volume-master',
        title: 'Master',
        items: [
          { key: 'masterVolume', label: 'Master Volume', description: 'Controls the overall game volume — affects all audio output', keywords: 'volume master level loud quiet' },
        ],
      },
    ],
  },
  {
    id: 'playback',
    title: 'Playback',
    subsections: [
      {
        id: 'playback-output',
        title: 'Output',
        items: [
          { key: 'audioChannels', label: 'Channels', description: 'Mono outputs a single audio channel, Stereo separates left and right for spatial sound', keywords: 'mono stereo channel' },
          { key: 'audioFreq', label: 'Sample Rate', description: 'Higher sample rates capture more audio detail — 44100 Hz (CD quality) or 48000 Hz recommended', keywords: 'frequency sample rate hz' },
          { key: 'audioSamples', label: 'Buffer Size', description: 'Controls the audio buffer — smaller values reduce latency but may cause crackling, larger values are more stable but add delay', keywords: 'buffer latency crackle' },
        ],
      },
    ],
  },
  {
    id: 'msu',
    title: 'MSU Audio',
    subsections: [
      {
        id: 'msu-import',
        title: 'Import',
        items: [
          { key: 'msuImport', label: 'MSU Pack', description: 'Import an MSU audio pack (.zip) to replace the original soundtrack with CD-quality music', keywords: 'msu import download pack zip' },
        ],
      },
      {
        id: 'msu-mode',
        title: 'Mode',
        items: [
          { key: 'enableMSU', label: 'MSU Mode', description: 'Replace the original SNES soundtrack with CD-quality music packs — requires MSU audio files in the ROM directory', keywords: 'msu music cd replacement deluxe opuz' },
          { key: 'resumeMSU', label: 'Resume MSU', description: 'When returning to an area, the MSU track resumes where it left off instead of restarting from the beginning', keywords: 'resume position' },
          { key: 'msuVolume', label: 'MSU Volume', description: 'Adjust the volume of MSU music tracks relative to the game\'s sound effects', keywords: 'volume level msu' },
        ],
      },
    ],
  },
];

function renderControl(key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null {
  switch (key) {
    case 'msuImport':
      return null; // handled by AudioSettings component directly
    case 'masterVolume':
      return (
        <Slider
          label="Master Volume"
          description="Controls the overall game volume — affects all audio output"
          value={settings.masterVolume ?? 100}
          min={0}
          max={100}
          step={5}
          onChange={(v) => onChange({ masterVolume: v })}
          formatValue={(v) => `${v}%`}
          mute={settings.masterVolume === 0}
        />
      );
    case 'audioChannels':
      return (
        <SegmentedControl
          label="Channels"
          description="Mono outputs a single audio channel, Stereo separates left and right for spatial sound"
          value={String(settings.audioChannels)}
          options={CHANNEL_OPTIONS}
          onChange={(v) => onChange({ audioChannels: Number(v) as 1 | 2 })}
        />
      );
    case 'audioFreq':
      return (
        <SegmentedControl
          label="Sample Rate"
          description="Higher sample rates capture more audio detail — 44100 Hz (CD quality) or 48000 Hz recommended"
          value={String(settings.audioFreq)}
          options={FREQ_OPTIONS}
          onChange={(v) => onChange({ audioFreq: Number(v) })}
        />
      );
    case 'audioSamples':
      return (
        <Slider
          label="Buffer Size"
          description="Controls the audio buffer — smaller values reduce latency but may cause crackling, larger values are more stable but add delay"
          value={bufferToStep(settings.audioSamples)}
          min={0}
          max={3}
          step={1}
          onChange={(step) => onChange({ audioSamples: stepToBuffer(step) })}
          formatValue={(step) => `${BUFFER_STEPS[step]}`}
        />
      );
    case 'enableMSU':
      return (
        <SegmentedControl
          label="MSU Mode"
          description="Replace the original SNES soundtrack with CD-quality music packs — requires MSU audio files in the ROM directory"
          value={settings.enableMSU}
          options={MSU_OPTIONS}
          onChange={(v) => onChange({ enableMSU: v as GameSettings['enableMSU'] })}
        />
      );
    case 'msuVolume':
      return (
        <Slider
          label="MSU Volume"
          description="Adjust the volume of MSU music tracks relative to the game's sound effects"
          value={settings.msuVolume}
          min={0}
          max={100}
          step={5}
          onChange={(v) => onChange({ msuVolume: v })}
          formatValue={(v) => `${v}%`}
          disabled={settings.enableMSU === 'false'}
        />
      );
    default:
      return null;
  }
}

function isDisabled(key: string, settings: GameSettings): boolean {
  if (key === 'resumeMSU') return settings.enableMSU === 'false';
  return false;
}

export const AudioSettings = (props: AudioSettingsProps) => {
  const { profileId, settings, onChange } = props;
  const renderControlWithProfile = (key: string, s: GameSettings, cb: (patch: Partial<GameSettings>) => void): ReactNode | null => {
    if (key === 'msuImport') {
      return <MsuImport profileId={profileId} />;
    }
    return renderControl(key, s, cb);
  };

  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      onChange={onChange}
      renderControl={renderControlWithProfile}
      isDisabled={isDisabled}
    />
  );
}
