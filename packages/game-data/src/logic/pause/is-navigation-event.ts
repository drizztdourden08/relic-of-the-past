/* @layer shared-game @kind logic */
import { NAVIGATION_EVENT_TYPES } from './navigation-events.constants';
import type { NavigationEvent, PauseEvent } from './pause.type';

const isNavigationEvent = (event: PauseEvent): event is NavigationEvent => NAVIGATION_EVENT_TYPES.has(event.type);

export { isNavigationEvent };
