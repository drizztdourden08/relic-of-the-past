/* @layer shared-hub @kind types */
type UploadedPart = {
  part: number;
  etag: string;
  size: number;
};

type UploadedParts = { parts: UploadedPart[] };

export type { UploadedPart, UploadedParts };
