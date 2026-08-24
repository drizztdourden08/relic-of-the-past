/* @layer renderer-components @kind logic */
/**
 * Section/subsection config for the Audio settings tab.
 *
 * Ordered by what a person actually reaches for: levels first, then the music pack, and the
 * device settings last — those three are derived from the pack in Auto, so they are the ones a
 * person should rarely need to open at all.
 */
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
        title: 'Music and effects',
        items: [
          { key: 'perGroupVolume', label: 'Independent Music / SFX', description: 'Mix music and sound effects separately. Off keeps the original audio mix exactly — the sliders below do nothing until this is on.', keywords: 'split independent music sfx mix per group separate volume' },
          { key: 'musicVolume', label: 'Music Volume', description: 'Sets the music level — the original soundtrack and any music pack alike, since a pack plays in place of it rather than alongside it', keywords: 'volume music bgm background msu pack' },
          { key: 'ambientVolume', label: 'Ambience Volume', description: 'Sets the replacement ambient-bed level — rain, waterfalls, wind played by a pack. The sound chip cannot split its own ambience, so this governs replacement audio only', keywords: 'volume ambience ambient bed rain water background loop pack replacement' },
          { key: 'sfxVolume', label: 'SFX Volume', description: 'Sets the sound-effects level', keywords: 'volume sfx sound effects' },
        ],
      },
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
          { key: 'msuConfigMode', label: 'Configuration', description: 'Auto reads the assigned pack and sets its format, sample rate, channels and buffer to match. Manual unlocks all of them.', keywords: 'auto manual automatic config msu pack' },
          { key: 'enableMSU', label: 'Pack Format', description: 'MSU, Deluxe, OPUZ or Deluxe OPUZ — read from the pack in Auto, chosen by hand in Manual. Packs are imported and assigned in the Data Manager.', keywords: 'msu music cd replacement deluxe opuz pack format' },
          { key: 'resumeMSU', label: 'Resume Tracks', description: 'Returning to an area picks its music up where it left off instead of restarting. Save states remember the position too.', keywords: 'resume position continue' },
        ],
      },
      {
        id: 'msu-sounds',
        title: 'Replacement sounds',
        items: [
          { key: 'packReplaceAmbient', label: 'Replace Ambient Sounds', description: 'Lets a pack take over the looping background beds — rain, waterfalls, the hum of a dungeon. Off hands nothing over on that channel, so every bed plays from the sound chip whatever the pack contains.', keywords: 'ambient bed loop background rain water hum pack replace sound' },
          { key: 'packReplaceSfx', label: 'Replace Sound Effects', description: 'Lets a pack take over the one-shot effects — bonks, explosions, menu blips. Off hands nothing over on those two channels, so every effect plays from the sound chip whatever the pack contains.', keywords: 'sfx effects one shot bonk explosion blip pack replace sound' },
        ],
      },
    ],
  },
  {
    id: 'playback',
    title: 'Output',
    subsections: [
      {
        id: 'playback-output',
        title: 'Audio device',
        items: [
          { key: 'audioFreq', label: 'Sample Rate', description: 'Output rate. Must match the pack format, which is why Auto sets it: 44100 Hz for MSU/Deluxe, 48000 Hz for OPUZ.', keywords: 'frequency sample rate hz automatic' },
          { key: 'audioChannels', label: 'Channels', description: 'Mono or stereo output. Replacement music is always stereo, so Auto keeps it there.', keywords: 'mono stereo channel automatic' },
          { key: 'audioSamples', label: 'Buffer Size', description: 'Latency against stability. This one depends on your machine rather than the pack, so Auto leaves it at a widely safe value.', keywords: 'buffer latency crackle automatic' },
        ],
      },
    ],
  },
];

export { SECTIONS };
