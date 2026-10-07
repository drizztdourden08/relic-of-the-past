/* @layer shared-hub @kind types */
/** One part the bucket already holds for an open multipart upload, as a resumed upload reads it. */
type UploadedPart = {
  part: number;
  etag: string;
  size: number;
};

/** What a site's parts route answers: every part of the upload already in the bucket. */
type UploadedParts = { parts: UploadedPart[] };

export type { UploadedPart, UploadedParts };
