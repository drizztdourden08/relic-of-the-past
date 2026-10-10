/* @layer tests @kind type */
type WriterWorkspace = {
  root: () => string;
  sourceOf: (relativePath: string) => Promise<string>;
};

export type { WriterWorkspace };
