/* @layer sanctuary-site @kind types */
import type { useFilesPage } from './behavior/useFilesPage';

type Scope = {
  id: string;
  label: string;
};

type FilesProps = {
  selectedId?: string;
};

type FilesPage = ReturnType<typeof useFilesPage>;

export type { Scope, FilesProps, FilesPage };
