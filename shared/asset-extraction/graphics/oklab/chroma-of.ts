/* @layer shared-asset-extraction @kind logic */
import type { Oklab } from './oklab.type';

const chromaOf = (lab: Oklab): number => Math.hypot(lab[1], lab[2]);

export { chromaOf };
