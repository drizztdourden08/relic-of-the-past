/* @layer renderer-widgets @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { ViewMode } from '@app/compounds/ChecksTracker';

const CHECKS_PREF_KEY = 'checks';
const NOTIFY_PREF = 'notify';
const NOTIFY_WHEN_CLOSED_PREF = 'notifyWhenClosed';
const STICKY_HEADER_PREF = 'stickyHeader';
const STICKY_HEADER_DEFAULT = true;
const VIEW_MODE_PREF = 'viewMode';
const VIEW_MODE_DEFAULT: ViewMode = 'visual';
const viewOptions = (t: I18n['t']): SegmentOption<ViewMode>[] => [
  { value: 'compact', label: t('views-checks:view.list.label'), title: t('views-checks:view.list.title') },
  { value: 'detailed', label: t('views-checks:view.detailed.label'), title: t('views-checks:view.detailed.title') },
  { value: 'visual', label: t('views-checks:view.visual.label'), title: t('views-checks:view.visual.title') },
];

export {
  CHECKS_PREF_KEY, NOTIFY_PREF, NOTIFY_WHEN_CLOSED_PREF, STICKY_HEADER_DEFAULT, STICKY_HEADER_PREF,
  VIEW_MODE_DEFAULT, VIEW_MODE_PREF, viewOptions,
};
