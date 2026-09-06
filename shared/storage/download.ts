/* @layer shared-storage @kind logic */
/** Fetch a URL to bytes with optional progress, replacing electron.net on every platform. */

type DownloadProgress = (loaded: number, total: number | null) => void;

const fetchToBytes = async (url: string, onProgress?: DownloadProgress): Promise<Uint8Array> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  const total = Number(res.headers.get('content-length')) || null;
  if (!res.body || !onProgress) return new Uint8Array(await res.arrayBuffer());

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress(loaded, total);
  }
  const all = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) { all.set(chunk, offset); offset += chunk.length; }
  return all;
};

export { fetchToBytes };
export type { DownloadProgress };
