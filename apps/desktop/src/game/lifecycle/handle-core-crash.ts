/* @layer bridge-wasm @kind logic */
import type { CoreCrash } from '@drizztdourden08/brock-port-kit/renderer';
import { setState } from '@rotp/game-core';
import { reportWasmCrash } from '../report-wasm-crash';

const handleCoreCrash = ({ error, event }: CoreCrash): void => {
  setState({ status: 'error', error: `WASM crashed: ${error.message}` });
  reportWasmCrash(error, event);
};

export { handleCoreCrash };
