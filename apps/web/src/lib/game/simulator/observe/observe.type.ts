/* @layer bridge-wasm @kind types */
import type { DetectedScreen } from '../screen-exits.type';

type DetectCache = Map<string, DetectedScreen | null>;

export type { DetectCache };
