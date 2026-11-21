/* @layer bridge-wasm @kind logic */
import type { AssetStepReport, AssetWorkerStep } from '@drizztdourden08/brock-port-kit/web-worker';
import type { ExtractData, ExtractInputs, ExtractStepId } from './extract-steps.type';
import { toWireError } from './to-wire-error';

const defineStep = <Id extends ExtractStepId>(
  run: (input: ExtractInputs[Id], data: ExtractData, report: AssetStepReport) => unknown,
): AssetWorkerStep => async (input, report, data) => {
  try {
    return await run(input as ExtractInputs[Id], data as ExtractData, report);
  } catch (err) {
    throw toWireError(err);
  }
};

export { defineStep };
