/* @layer renderer-widgets @kind data */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { NavMode } from '../../../stores/navigation-overlay-store';

const modeOptions = (t: I18n['t']): SegmentOption<NavMode>[] => [
  { value: 'manual', label: t('views-navigation:functions.mode.manual') },
  { value: 'auto', label: t('views-navigation:functions.mode.auto') },
];

export { modeOptions };
