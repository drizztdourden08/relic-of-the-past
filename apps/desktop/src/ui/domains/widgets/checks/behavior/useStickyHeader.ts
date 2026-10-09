/* @layer renderer-widgets @kind hook */
import { useWidgetPref } from '@drizztdourden08/brock-react';
import { CHECKS_PREF_KEY, STICKY_HEADER_DEFAULT, STICKY_HEADER_PREF } from '../checks.constants';

const useStickyHeader = (): readonly [boolean, (next: boolean) => void] =>
  useWidgetPref<boolean>(CHECKS_PREF_KEY, STICKY_HEADER_PREF, STICKY_HEADER_DEFAULT);

export { useStickyHeader };
