/* @layer bridge-wasm @kind logic */
import { log } from '../log-bus';
import { writeCrashDump } from '../crash-dump';

const logStackLines = (stack: string): void => {
  for (const line of stack.split('\n').slice(1, 10)) {
    const trimmed = line.trim();
    if (trimmed) log.error(`  ${trimmed}`);
  }
};

const reportWasmCrash = (err: WebAssembly.RuntimeError, event: ErrorEvent): void => {
  log.error(`WASM crashed: ${err.message}`);
  if (err.stack) logStackLines(err.stack);
  if (event.filename) log.error(`  at ${event.filename}:${event.lineno}:${event.colno}`);
  void writeCrashDump(err.message, err.stack);
};

export { reportWasmCrash };
