/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { MsuPackProfile, ResolvedAudioConfig } from '@rotp/features';

const layersOf = (pack: MsuPackProfile): 'extended' | 'layered' | 'plain' => {
  if (!pack.isLayered) return 'plain';
  return pack.isDeluxe ? 'extended' : 'layered';
};

const packDetail = (pack: MsuPackProfile, resolved: ResolvedAudioConfig, t: I18n['t']): string =>
  t('settings-controls:audio.pack-detail', {
    layers: layersOf(pack),
    freq: resolved.audioFreq,
    channels: resolved.audioChannels === 1 ? 'mono' : 'stereo',
  });

export { packDetail };
