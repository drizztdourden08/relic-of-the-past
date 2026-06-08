/* @layer renderer-components @kind logic */
/** Section/subsection config for the Audio settings tab. */
import type { Section } from '../../../compounds/SettingsLayout';

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
      {
        id: 'volume-channels',
        title: 'Channels',
        items: [
          { key: 'musicVolume', label: 'Music Volume', description: 'Controls the background music volume (SPC channels 0-5)', keywords: 'volume music bgm background' },
          { key: 'sfxVolume', label: 'SFX Volume', description: 'Controls the sound effects volume (SPC channels 6-7)', keywords: 'volume sfx sound effects' },
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

export { SECTIONS };
