/* @layer sanctuary-site @kind logic */
import type { ZipEntry, ZipProgress } from './zip-files.type';

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

const loadJsZipOnFirstUse = async () => (await import('jszip')).default;

const zipFiles = async (entries: readonly ZipEntry[], onProgress: (progress: ZipProgress) => void): Promise<Blob> => {
  const JSZip = await loadJsZipOnFirstUse();
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
