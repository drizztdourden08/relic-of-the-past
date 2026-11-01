/* @layer tooling-scripts @kind types */
import type { EnumerationEntry } from '@rotp/game-data';

export declare const buildGeneratedTypesSource: (allEnumeration: readonly EnumerationEntry[]) => string;
export declare const generateEnumTypes: (root?: string) => Promise<string>;
