/* @layer renderer-other @kind logic */
interface FormatBytesOptions {
  /** Returned when bytes is null/undefined (default '0 B'). */
  nullText?: string;
  /** Decimal places for the KB tier (default 1). */
  kbDecimals?: number;
}

const formatBytes = (bytes: number | null | undefined, options: FormatBytesOptions = {}): string => {
  const { nullText = '0 B', kbDecimals = 1 } = options;
  if (bytes == null) return nullText;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(kbDecimals)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export { formatBytes };
export type { FormatBytesOptions };
