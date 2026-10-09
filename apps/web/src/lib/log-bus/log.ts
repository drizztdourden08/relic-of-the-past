/* @layer renderer-lib @kind logic */
import type { LogLevel } from './log-bus.type';
import { emit } from './emit';

const log = {
  core(msg: string, level: LogLevel = 'info'): void { emit('core', level, msg); },
  app(msg: string, level: LogLevel = 'info'): void { emit('app', level, msg); },
  randomizer(msg: string, level: LogLevel = 'info'): void { emit('randomizer', level, msg); },
  wasm(msg: string, level: LogLevel = 'info'): void { emit('wasm', level, msg); },
  ipc(msg: string, level: LogLevel = 'info'): void { emit('ipc', level, msg); },
  sim(msg: string, level: LogLevel = 'info'): void { emit('sim', level, msg); },
  error(msg: string): void { emit('error', 'error', msg); },
};

export { log };
