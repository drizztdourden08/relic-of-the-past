/* @layer sanctuary-site @kind logic */
/**
 * Builds one zip in the browser from the files' download links. Each file is read in
 * turn, with its bytes counted as they arrive, then the zip is written without
 * compression: builds, saves and art are already packed, and storing is fast.
 */
type ZipEntry = {
  name: string;
  /** Fetched only when the entry's turn comes, so a signed link is fresh when read. */
  url: () => Promise<string>;
};

type ZipProgress = {
  /** Bytes read so far, over every file. */
  read: number;
  /** Set while the zip itself is written, 0 to 100. */
  packing: number | null;
};

const readBlob = async (url: string, onBytes: (n: number) => void): Promise<Blob> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`A file could not be read (HTTP ${response.status}).`);
  if (!response.body) {
    const blob = await response.blob();
    onBytes(blob.size);
    return blob;
  }
  const reader = response.body.getReader();
  const chunks: BlobPart[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    onBytes(value.byteLength);
  }
  return new Blob(chunks);
};

const zipFiles = async (entries: readonly ZipEntry[], onProgress: (progress: ZipProgress) => void): Promise<Blob> => {
  /* Loaded on the first batch download, so the site does not carry it on every page. */
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  let read = 0;
  for (const entry of entries) {
    const blob = await readBlob(await entry.url(), (n) => {
      read += n;
      onProgress({ read, packing: null });
    });
    zip.file(entry.name, blob);
  }
  return zip.generateAsync(
    { type: 'blob', compression: 'STORE', streamFiles: true },
    (meta) => onProgress({ read, packing: meta.percent }),
  );
};

export { zipFiles };
export type { ZipEntry, ZipProgress };
