/* @layer tests @kind types */
import type { GenerateRequest } from '@rotp/randomizer';

interface GoldenCase {
  name: string;
  request: GenerateRequest;
}

export type { GoldenCase };
