/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { SettingsSection } from './settings-sections.type';

const percent = (v: unknown): string => `${v ?? 100}%`;

const AUDIO_SECTION: SettingsSection = {
  title: msg('data-manager:settings-sections.title.audio'),
  keys: [
    { key: 'enableAudio', label: msg('data-manager:settings-sections.label.enable-audio') },
    { key: 'masterVolume', label: msg('data-manager:settings-sections.label.master-volume'), format: percent },
    { key: 'musicVolume', label: msg('data-manager:settings-sections.label.music-volume'), format: percent },
    { key: 'sfxVolume', label: msg('data-manager:settings-sections.label.sfx-volume'), format: percent },
    { key: 'ambientVolume', label: msg('data-manager:settings-sections.label.ambient-volume'), format: percent },
    { key: 'audioFreq', label: msg('data-manager:settings-sections.label.audio-freq'), format: (v) => `${v ?? 44100} Hz` },
    { key: 'audioChannels', label: msg('data-manager:settings-sections.label.audio-channels'), format: (v, t) => (v === 1 ? t('data-manager:settings-sections.value.mono') : t('data-manager:settings-sections.value.stereo')) },
    { key: 'audioSamples', label: msg('data-manager:settings-sections.label.audio-samples'), format: (v) => String(v ?? 2048) },
  ],
};

const MSU_SECTION: SettingsSection = {
  title: msg('data-manager:settings-sections.title.msu'),
  keys: [
    { key: 'msuConfigMode', label: msg('data-manager:settings-sections.label.msu-config-mode'), format: (v, t) => (v === 'manual' ? t('data-manager:settings-sections.value.manual') : t('data-manager:settings-sections.value.auto')) },
    { key: 'enableMSU', label: msg('data-manager:settings-sections.label.enable-msu'), format: (v, t) => (v === 'false' || !v ? t('data-manager:settings-sections.value.off') : String(v)) },
    { key: 'resumeMSU', label: msg('data-manager:settings-sections.label.resume-msu') },
    { key: 'resetMSUAtTitle', label: msg('data-manager:settings-sections.label.reset-msu-at-title') },
    { key: 'packReplaceAmbient', label: msg('data-manager:settings-sections.label.pack-replace-ambient') },
    { key: 'packReplaceSfx', label: msg('data-manager:settings-sections.label.pack-replace-sfx') },
  ],
};

const CONTROLS_SECTION: SettingsSection = {
  title: msg('data-manager:settings-sections.title.controls'),
  keys: [
    { key: 'mapOnSelect', label: msg('data-manager:settings-sections.label.map-on-select') },
    { key: 'hapticsEnabled', label: msg('data-manager:settings-sections.label.haptics-enabled') },
  ],
};

export { AUDIO_SECTION, CONTROLS_SECTION, MSU_SECTION };
