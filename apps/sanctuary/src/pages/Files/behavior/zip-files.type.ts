/* @layer sanctuary-site @kind types */
type ZipEntry = {
  name: string;
  url: () => Promise<string>;
};

type ZipProgress = {
  read: number;
  packing: number | null;
};

export type { ZipEntry, ZipProgress };
