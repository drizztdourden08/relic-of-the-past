/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Audio', icon: 'volume-2', order: 2, keywords: ['audio', 'volume', 'music', 'msu', 'pack', 'sound'] };

const configModes = [
  { value: 'auto', label: 'Auto', hint: 'Reads the assigned pack and sets format, sample rate, channels and buffer for you.' },
  { value: 'manual', label: 'Manual', hint: 'Lets you set every one of them by hand.' },
];

const sections: Section[] = [
  {
    id: 'volume',
    title: 'Volume',
    items: [
      { key: 'masterVolume', label: 'Master Volume', description: 'Controls the overall game volume, so it affects all audio output', keywords: 'volume master level loud quiet' },
      { key: 'perGroupVolume', label: 'Independent Music / SFX', description: 'Mix music and sound effects separately.', keywords: 'split independent music sfx mix per group separate volume' },
      { key: 'musicVolume', label: 'Music Volume', description: 'Sets the music level, for the original soundtrack and any music pack', hint: 'Needs Independent Music / SFX.', keywords: 'volume music bgm background msu pack' },
      { key: 'ambientVolume', label: 'Ambience Volume', description: 'Sets the level of the rain, waterfalls and wind played by a pack', hint: 'Needs Independent Music / SFX.', keywords: 'volume ambience ambient bed rain water background loop pack replacement' },
      { key: 'sfxVolume', label: 'SFX Volume', description: 'Sets the sound-effects level', hint: 'Needs Independent Music / SFX.', keywords: 'volume sfx sound effects' },
    ],
  },
  {
    id: 'msu',
    title: 'Music Packs',
    subsections: [
      {
        id: 'msu-mode',
        title: 'Replacement music',
        items: [
          { key: 'msuConfigMode', label: 'Configuration', description: 'Auto matches the assigned pack. Manual lets you set each option.', keywords: 'auto manual automatic config msu pack', control: { kind: 'choice', options: configModes } },
          { key: 'enableMSU', label: 'Pack Format', description: 'MSU, Deluxe, OPUZ or Deluxe OPUZ. Auto reads it from the pack.', keywords: 'msu music cd replacement deluxe opuz pack format' },
          { key: 'resumeMSU', label: 'Resume Tracks', description: 'Returning to an area picks its music up where it left off instead of restarting.', keywords: 'resume position continue' },
          { key: 'resetMSUAtTitle', label: 'Reset At Title Screen', description: 'Reaching the title screen forgets every remembered position, so a new run starts with fresh music.', keywords: 'reset title intro restart new game fresh resume position' },
        ],
      },
      {
        id: 'msu-sounds',
        title: 'Replacement sounds',
        items: [
          { key: 'packReplaceAmbient', label: 'Replace Ambient Sounds', description: 'Lets a pack take over the looping background sounds: rain, waterfalls, the hum of a dungeon.', keywords: 'ambient bed loop background rain water hum pack replace sound' },
          { key: 'packReplaceSfx', label: 'Replace Sound Effects', description: 'Lets a pack take over the one-shot effects: bonks, explosions, menu blips.', keywords: 'sfx effects one shot bonk explosion blip pack replace sound' },
        ],
      },
    ],
  },
  {
    id: 'playback',
    title: 'Audio Device',
    items: [
      { key: 'audioFreq', label: 'Sample Rate', description: 'Output rate: 44100 Hz for MSU/Deluxe, 48000 Hz for OPUZ.', keywords: 'frequency sample rate hz automatic output' },
      { key: 'audioChannels', label: 'Channels', description: 'Mono or stereo output.', hint: 'Auto keeps stereo.', keywords: 'mono stereo channel automatic output' },
      { key: 'audioSamples', label: 'Buffer Size', description: 'Latency against stability.', hint: 'Smaller buffers may crackle.', keywords: 'buffer latency crackle automatic output' },
    ],
  },
];

export default sections;
export { meta };
