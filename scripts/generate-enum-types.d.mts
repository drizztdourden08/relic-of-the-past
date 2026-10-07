/* @layer tooling-scripts @kind types */
/** Ambient types for generate-enum-types.mjs's importable surface. Behavior lives in that file. */
import type { EnumerationEntry } from '../shared/game/data/types/enumeration';

export declare const buildGeneratedTypesSource: (allEnumeration: readonly EnumerationEntry[]) => string;
export declare const generateEnumTypes: (root?: string) => Promise<string>;
