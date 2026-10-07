/* @layer renderer-widgets @kind hook */
/**
 * The widget's pinned-header preference. A per-profile widget pref, so the
 * settings panel and the tracker below it read the same value with no event
 * plumbing, and it survives the widget being unmounted and the app closing.
 */
import { useWidgetPref } from '@app/hooks/useWidgetPref';
import { CHECKS_PREF_KEY, STICKY_HEADER_DEFAULT, STICKY_HEADER_PREF } from '../checks.constants';

const useStickyHeader = (): readonly [boolean, (next: boolean) => void] =>
  useWidgetPref<boolean>(CHECKS_PREF_KEY, STICKY_HEADER_PREF, STICKY_HEADER_DEFAULT);

export { useStickyHeader };
