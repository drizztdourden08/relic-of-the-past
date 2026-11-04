/* @layer tests @kind types */
import type { generatePlacement } from '@rotp/randomizer';

interface GoldenCase {
  name: string;
  request: Parameters<typeof generatePlacement>[0];
}

export type { GoldenCase };
