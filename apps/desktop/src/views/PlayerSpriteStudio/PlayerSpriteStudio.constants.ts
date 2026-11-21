/* @layer renderer-components @kind constants */
import type { Facing, GloveLevel } from '@rotp/game-data';

const STATES_PANEL = { storageKey: 'sprite-studio.states', width: 224, minWidth: 192, maxWidth: 320 };

const PROPERTIES_PANEL = { storageKey: 'sprite-studio.properties', width: 288, minWidth: 240, maxWidth: 400 };

const FACING_KEYS: Record<Facing, string> = { 0: 'up', 1: 'down', 2: 'left', 3: 'right' };

const GLOVE_KEYS: Record<GloveLevel, string> = { 0: 'none', 1: 'power', 2: 'titan' };

export { FACING_KEYS, GLOVE_KEYS, PROPERTIES_PANEL, STATES_PANEL };
