/* @layer sanctuary-site @kind types */
type UploadFacts = {
  name: string;
  bytes: number;
  sha256: string | null;
  contentType: string;
};

export type { UploadFacts };
