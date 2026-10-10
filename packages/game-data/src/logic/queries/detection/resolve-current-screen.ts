/* @layer shared-game @kind logic */
import type { ScreenRecord } from '../../../data';
import type { ScreenQuery } from './detection.type';
import { resolveCurrentScreenDetailed } from './resolve-current-screen-detailed';

const resolveCurrentScreen = (query: ScreenQuery): ScreenRecord | null =>
  resolveCurrentScreenDetailed(query)?.screen ?? null;

export { resolveCurrentScreen };
