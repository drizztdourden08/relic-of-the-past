/* @layer bridge-wasm @kind types */
type LinkDownload = {
  fileId: string;
  parts: { offset: number; bytes: Uint8Array }[];
  resolve: (bytes: Uint8Array) => void;
  reject: (error: Error) => void;
};

export type { LinkDownload };
