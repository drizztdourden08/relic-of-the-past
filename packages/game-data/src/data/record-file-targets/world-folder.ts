/* @layer shared-game @kind logic */
import type { ScreenWorld, World } from '../types';

const worldFolder = (world: World | ScreenWorld): string => `${world === 'dark' ? 'dark' : 'light'}-world`;

export { worldFolder };
