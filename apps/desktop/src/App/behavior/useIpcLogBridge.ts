import { useEffect } from 'react';
import { log } from '../../lib/log-bus';
import type { LogChannel, LogLevel } from '../../lib/log-bus';

const useIpcLogBridge = () => {
  useEffect(() => {
    return window.api.onLogEntry((entry) => {
      const channel = entry.channel as LogChannel;
      const level = entry.level as LogLevel;
      if (channel in log && typeof log[channel] === 'function') {
        log[channel](entry.message, level);
      }
    });
  }, []);
};

export { useIpcLogBridge };
