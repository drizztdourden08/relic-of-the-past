/* @layer renderer-lib @kind constants */
import type { LogChannel } from './log-bus.type';

const CHANNEL_COLORS: Record<LogChannel, string> = {
  core: '#4a9',
  app: '#5b9bd5',
  randomizer: '#b388ff',
  wasm: '#4dd0e1',
  ipc: '#ffd54f',
  sim: '#ff9e64',
  error: '#e94560',
};

export { CHANNEL_COLORS };
