/* @layer shared-store @kind types */
type ZipEntry = {
  name: string;
  method: 'store' | 'deflate';
  offset: number;
  compressedBytes: number;
  bytes: number;
};

type EndRecord = { entryCount: number; directoryBytes: number; directoryOffset: number };

type SignatureMark = readonly [third: number, fourth: number];

export type { ZipEntry, EndRecord, SignatureMark };
