/* @layer bridge-wasm @kind logic */
/** Writes a core crash to the log with its stack, and leaves a crash dump behind. */
import { log } from '../log-bus';
import { writeCrashDump } from '../crash-dump';

const reportWasmCrash = (err: WebAssembly.RuntimeError, event: ErrorEvent): void => {
  log.error(`WASM crashed: ${err.message}`);
  if (err.stack) {
    for (const line of err.stack.split('\n').slice(1, 10)) {
      const trimmed = line.trim();
      if (trimmed) log.error(`  ${trimmed}`);
    }
  }
  if (event.filename) log.error(`  at ${event.filename}:${event.lineno}:${event.colno}`);
  // After the stack lines above, so the dump's log buffer carries them too.
  void writeCrashDump(err.message, err.stack);
};

export { reportWasmCrash };
