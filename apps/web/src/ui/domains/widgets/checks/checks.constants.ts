/* @layer renderer-widgets @kind constants */

/** Where the pinned-header preference lives, shared by the widget and its settings. */
const STICKY_HEADER_KEY = 'checks-widget-sticky-header';

/** The widget id its preferences are kept under (useWidgetPref). */
const CHECKS_WIDGET_ID = 'checks';
/** Toasts for completed checks: on at all, and also while the tracker is closed. */
const NOTIFY_PREF = 'notify';
const NOTIFY_WHEN_CLOSED_PREF = 'notifyWhenClosed';

export { CHECKS_WIDGET_ID, NOTIFY_PREF, NOTIFY_WHEN_CLOSED_PREF, STICKY_HEADER_KEY };
