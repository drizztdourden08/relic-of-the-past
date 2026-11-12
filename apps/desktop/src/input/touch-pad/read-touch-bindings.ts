/* @layer renderer-lib @kind logic */
import { liveSettingsNow } from '@app/game/live-settings';
import type { TouchBindings } from '@rotp/features';
import { NO_TOUCH_BINDINGS } from './read-touch-bindings.constants';

const readTouchBindings = (): TouchBindings =>
  liveSettingsNow()?.touchControls.bindings ?? NO_TOUCH_BINDINGS;

export { readTouchBindings };
