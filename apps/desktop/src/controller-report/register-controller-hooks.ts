/* @layer renderer-app @kind logic */
import { registerDeviceCardActions, registerGlyphSource, registerRumbleTests } from '@drizztdourden08/brock-input/renderer';
import { DEVICE_CARD_ACTIONS, GLYPH_SOURCE, RUMBLE_TESTS } from './controller-report.constants';

const registerControllerHooks = (): void => {
  registerDeviceCardActions(DEVICE_CARD_ACTIONS);
  registerRumbleTests(RUMBLE_TESTS);
  registerGlyphSource(GLYPH_SOURCE);
};

export { registerControllerHooks };
