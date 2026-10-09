/* @layer shared-storage @kind types */
import type {
  GlossaryTerm, NameTable, SetStructure, Variable,
} from '../../messages';

type SetContent = {
  variables: Variable[];
  structure: SetStructure;
  glossary: GlossaryTerm[];
  names: NameTable;
};

export type { SetContent };
