/* @layer renderer-app @kind config */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenMeta, SectionDef } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: msg('data-manager:settings-sections.title.audio'), icon: 'volume-2', order: 2, keywords: ['audio', 'volume', 'music', 'msu', 'pack', 'sound'] };

const configModes = [
  { value: 'auto', label: msg('settings-audio:option.config-modes.auto.label'), hint: msg('settings-audio:option.config-modes.auto.hint') },
  { value: 'manual', label: msg('settings-audio:option.config-modes.manual.label'), hint: msg('settings-audio:option.config-modes.manual.hint') },
];

const sections: SectionDef[] = [
  {
    id: 'volume',
    title: msg('settings-audio:section.volume.title'),
    items: [
      { key: 'masterVolume', label: msg('settings-audio:master-volume.label'), description: msg('settings-audio:master-volume.description'), keywords: 'volume master level loud quiet' },
      { key: 'perGroupVolume', label: msg('settings-audio:per-group-volume.label'), description: msg('settings-audio:per-group-volume.description'), keywords: 'split independent music sfx mix per group separate volume' },
      { key: 'musicVolume', label: msg('settings-audio:music-volume.label'), description: msg('settings-audio:music-volume.description'), hint: msg('settings-audio:music-volume.hint'), keywords: 'volume music bgm background msu pack' },
      { key: 'ambientVolume', label: msg('settings-audio:ambient-volume.label'), description: msg('settings-audio:ambient-volume.description'), hint: msg('settings-audio:ambient-volume.hint'), keywords: 'volume ambience ambient bed rain water background loop pack replacement' },
      { key: 'sfxVolume', label: msg('settings-audio:sfx-volume.label'), description: msg('settings-audio:sfx-volume.description'), hint: msg('settings-audio:sfx-volume.hint'), keywords: 'volume sfx sound effects' },
    ],
  },
  {
    id: 'msu',
    title: msg('settings-audio:section.msu.title'),
    subsections: [
      {
        id: 'msu-mode',
        title: msg('settings-audio:section.msu-mode.title'),
        items: [
          { key: 'msuConfigMode', label: msg('settings-audio:msu-config-mode.label'), description: msg('settings-audio:msu-config-mode.description'), keywords: 'auto manual automatic config msu pack', control: { kind: 'choice', options: configModes } },
          { key: 'enableMSU', label: msg('settings-audio:enable-msu.label'), description: msg('settings-audio:enable-msu.description'), keywords: 'msu music cd replacement deluxe opuz pack format' },
          { key: 'resumeMSU', label: msg('settings-audio:resume-msu.label'), description: msg('settings-audio:resume-msu.description'), keywords: 'resume position continue' },
          { key: 'resetMSUAtTitle', label: msg('settings-audio:reset-msu-at-title.label'), description: msg('settings-audio:reset-msu-at-title.description'), keywords: 'reset title intro restart new game fresh resume position' },
        ],
      },
      {
        id: 'msu-sounds',
        title: msg('settings-audio:section.msu-sounds.title'),
        items: [
          { key: 'packReplaceAmbient', label: msg('settings-audio:pack-replace-ambient.label'), description: msg('settings-audio:pack-replace-ambient.description'), keywords: 'ambient bed loop background rain water hum pack replace sound' },
          { key: 'packReplaceSfx', label: msg('settings-audio:pack-replace-sfx.label'), description: msg('settings-audio:pack-replace-sfx.description'), keywords: 'sfx effects one shot bonk explosion blip pack replace sound' },
        ],
      },
    ],
  },
  {
    id: 'playback',
    title: msg('settings-audio:section.playback.title'),
    items: [
      { key: 'audioFreq', label: msg('settings-audio:audio-freq.label'), description: msg('settings-audio:audio-freq.description'), keywords: 'frequency sample rate hz automatic output' },
      { key: 'audioChannels', label: msg('settings-audio:audio-channels.label'), description: msg('settings-audio:audio-channels.description'), hint: msg('settings-audio:audio-channels.hint'), keywords: 'mono stereo channel automatic output' },
      { key: 'audioSamples', label: msg('settings-audio:audio-samples.label'), description: msg('settings-audio:audio-samples.description'), hint: msg('settings-audio:audio-samples.hint'), keywords: 'buffer latency crackle automatic output' },
    ],
  },
];

export default sections;
export { meta };
