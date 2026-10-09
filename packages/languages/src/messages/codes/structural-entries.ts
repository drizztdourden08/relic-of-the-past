/* @layer shared-game @kind logic */
import type { StructuralEntry } from './code-catalog.type';
import { STRUCTURAL_BY_ID } from './structural-entries.constants';

const structuralEntry = (id: number): StructuralEntry | null => STRUCTURAL_BY_ID.get(id) ?? null;

export { structuralEntry };
