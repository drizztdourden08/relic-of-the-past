/* @layer renderer-other @kind logic */
import { getPlatform } from '@drizztdourden08/brock-react';
import type { DisplayPort } from '@shared/platform';
import { NOOP_DISPLAY } from './noop/noop-display.constants';

const displayPort = (): DisplayPort => getPlatform().display ?? NOOP_DISPLAY;

export { displayPort };
