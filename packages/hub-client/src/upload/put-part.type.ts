/* @layer site-kit @kind types */
type PutPartParams = {
  url: string;
  blob: Blob;
  onProgress: (loaded: number) => void;
  signal?: AbortSignal;
};

export type { PutPartParams };
