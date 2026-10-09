/* @layer renderer-lib @kind logic */
import { getAppLog } from '@drizztdourden08/brock-react';
import type { LogChannel, LogLevel } from './log-bus.type';

const emit = (channel: LogChannel, level: LogLevel, message: string): void => {
  if (channel === 'error') getAppLog().error(message);
  else getAppLog().log(channel, message, level);
};

export { emit };
