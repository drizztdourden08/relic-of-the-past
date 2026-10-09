/* @layer bridge-wasm @kind logic */
import { reportWasmCrash } from '../report-wasm-crash';
import { setState } from '../wasm-bridge';
import type { WasmCrashGuard } from './lifecycle.type';

const createWasmCrashGuard = (): WasmCrashGuard => {
  let armed = false;
  let crashed = false;
  const handler = (event: ErrorEvent): void => {
    const err = event.error;
    if (!(err instanceof WebAssembly.RuntimeError)) return;
    event.preventDefault();
    if (!armed || crashed) return;
    crashed = true;
    setState({ status: 'error', error: `WASM crashed: ${err.message}` });
    reportWasmCrash(err, event);
  };
  const arm = (): void => {
    armed = true;
  };
  return { handler, arm };
};

export { createWasmCrashGuard };
