/* @layer shared-storage @kind types */
type DownloadProgress = (loaded: number, total: number | null) => void;

export type { DownloadProgress };
