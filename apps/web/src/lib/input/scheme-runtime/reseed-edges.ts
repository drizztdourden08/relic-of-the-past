/* @layer renderer-lib @kind logic */
import { schemeRuntime } from './scheme-runtime-state';

const reseedEdges = (): void => { schemeRuntime.reseedPrev = true; };

export { reseedEdges };
