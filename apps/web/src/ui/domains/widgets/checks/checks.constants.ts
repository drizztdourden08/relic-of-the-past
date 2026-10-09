/* @layer renderer-widgets @kind constants */
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { ViewMode } from '@domains/app/compounds/ChecksTracker';

const CHECKS_PREF_KEY = 'checks';
const NOTIFY_PREF = 'notify';
const NOTIFY_WHEN_CLOSED_PREF = 'notifyWhenClosed';
const STICKY_HEADER_PREF = 'stickyHeader';
const STICKY_HEADER_DEFAULT = true;
const VIEW_MODE_PREF = 'viewMode';
const VIEW_MODE_DEFAULT: ViewMode = 'visual';
const VIEW_OPTIONS: SegmentOption<ViewMode>[] = [
  { value: 'compact', label: 'List', title: 'Compact rows' },
  { value: 'detailed', label: 'Detailed', title: 'Rows with items' },
  { value: 'visual', label: 'Cards', title: 'Item cards' },
];

export {
  CHECKS_PREF_KEY, NOTIFY_PREF, NOTIFY_WHEN_CLOSED_PREF, STICKY_HEADER_DEFAULT, STICKY_HEADER_PREF,
  VIEW_MODE_DEFAULT, VIEW_MODE_PREF, VIEW_OPTIONS,
};
