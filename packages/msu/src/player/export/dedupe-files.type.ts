/* @layer renderer-lib @kind types */
interface DedupedFiles {
  entries: { name: string; bytes: Uint8Array }[];
  canonical: Map<string, string>;
}

type LoadBytes = (fileName: string) => Promise<Uint8Array | null>;

export type { DedupedFiles, LoadBytes };
