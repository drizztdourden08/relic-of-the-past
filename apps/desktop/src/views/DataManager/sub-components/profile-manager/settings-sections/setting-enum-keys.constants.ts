/* @layer renderer-components @kind constants */
import type { MessageKey } from '@drizztdourden08/brock-core/i18n';

const SETTING_ENUM_KEYS: Readonly<Record<string, MessageKey>> = {
  windowed: 'data-manager:settings-sections.enum.windowed',
  borderless: 'data-manager:settings-sections.enum.borderless',
  fullscreen: 'data-manager:settings-sections.enum.fullscreen',
  none: 'data-manager:settings-sections.enum.none',
  fit: 'data-manager:settings-sections.enum.fit',
  fill: 'data-manager:settings-sections.enum.fill',
  original: 'data-manager:settings-sections.enum.original',
  enhanced: 'data-manager:settings-sections.enum.enhanced',
  vanilla: 'data-manager:settings-sections.enum.vanilla',
  modern: 'data-manager:settings-sections.enum.modern',
  match: 'data-manager:settings-sections.enum.match',
  custom: 'data-manager:settings-sections.enum.custom',
  smooth: 'data-manager:settings-sections.enum.smooth',
  accurate: 'data-manager:settings-sections.enum.accurate',
  centered: 'data-manager:settings-sections.enum.centered',
  pixel: 'data-manager:settings-sections.enum.pixel',
  reimagined: 'data-manager:settings-sections.enum.reimagined',
  still: 'data-manager:settings-sections.enum.still',
  drifting: 'data-manager:settings-sections.enum.drifting',
};

export { SETTING_ENUM_KEYS };
