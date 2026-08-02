/* @layer tooling-scripts @kind types */
/** Ambient types for generate-enum-types.mjs's importable surface — see that file for behavior. */
import type { EnumerationEntry } from '../shared/game/data/types/enumeration';

export declare const buildGeneratedTypesSource: (allEnumeration: readonly EnumerationEntry[]) => string;
export declare const generateEnumTypes: () => Promise<string>;
