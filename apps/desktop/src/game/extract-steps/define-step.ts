/* @layer bridge-wasm @kind logic */
import type { AssetStepReport, AssetWorkerStep } from '@drizztdourden08/brock-port-kit/web-worker';
import type { ExtractData, ExtractInputs, ExtractStepId } from './extract-steps.type';

const defineStep = <Id extends ExtractStepId>(
  run: (input: ExtractInputs[Id], data: ExtractData, report: AssetStepReport) => unknown,
): AssetWorkerStep => (input, report, data) => run(input as ExtractInputs[Id], data as ExtractData, report);

export { defineStep };
