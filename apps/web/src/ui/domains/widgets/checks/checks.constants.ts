/* @layer renderer-widgets @kind constants */
import type { SegmentOption } from '@ds/primitives';
import type { ViewMode } from '@domains/app/compounds/ChecksTracker';

/** The widget id every checks pref is keyed under; the tracker data uses the same one. */
const CHECKS_PREF_KEY = 'checks';

/** Toasts for completed checks: on at all, and also while the tracker is closed. */
const NOTIFY_PREF = 'notify';
const NOTIFY_WHEN_CLOSED_PREF = 'notifyWhenClosed';

/** Pref name for the pinned header, shared by the widget and its settings. */
const STICKY_HEADER_PREF = 'stickyHeader';
const STICKY_HEADER_DEFAULT = true;

/** Pref name for the tracker's view mode; the same key useTrackerData writes. */
const VIEW_MODE_PREF = 'viewMode';
const VIEW_MODE_DEFAULT: ViewMode = 'visual';

/** Module-level so the array identity is stable across renders. */
const VIEW_OPTIONS: SegmentOption<ViewMode>[] = [
  { value: 'compact', label: 'List', title: 'Compact rows' },
  { value: 'detailed', label: 'Detailed', title: 'Rows with items' },
  { value: 'visual', label: 'Cards', title: 'Item cards' },
];

export {
  CHECKS_PREF_KEY, NOTIFY_PREF, NOTIFY_WHEN_CLOSED_PREF, STICKY_HEADER_DEFAULT, STICKY_HEADER_PREF,
  VIEW_MODE_DEFAULT, VIEW_MODE_PREF, VIEW_OPTIONS,
};
