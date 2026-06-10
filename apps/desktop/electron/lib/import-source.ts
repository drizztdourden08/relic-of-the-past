/* @layer electron-main @kind logic */
/**
 * Resolve an import source (a local file path or a remote URL) to the set of
 * matching files inside it — transparently handling direct files, archives
 * (.zip/.7z/.rar) and URL downloads — and hand back a cleanup() for any temps.
 */
import { extname } from 'path';
import { rm } from 'fs/promises';
import { extractArchiveToTemp, walkFiles } from './archive';
import { downloadToTemp } from './download';
import { ARCHIVE_EXTENSIONS } from './extensions';

type ImportSource =
  | { kind: 'path'; path: string }
  | { kind: 'url'; url: string };

interface ResolvedSource {
  /** Absolute paths of files matching the requested extensions. */
  files: string[];
  /** True if the source was successfully opened as an archive (vs a raw file). */
  extractedArchive: boolean;
  /** The temp file a URL was downloaded to (null for path sources). */
  downloadedPath: string | null;
  /** Remove every temp file/dir this resolution created. */
  cleanup: () => Promise<void>;
}

const isArchive = (filePath: string): boolean =>
  ARCHIVE_EXTENSIONS.has(extname(filePath).toLowerCase());

/** Reports the resolver's source stages (download bytes, archive extraction). */
type SourceProgress = (stage: { phase: 'download' | 'extract'; loaded?: number; total?: number }) => void;

const resolveSourceFiles = async (source: ImportSource, matchExtensions: Set<string>, onProgress?: SourceProgress): Promise<ResolvedSource> => {
  const temps: string[] = [];
  const cleanup = async (): Promise<void> => {
    for (const t of temps) await rm(t, { recursive: true, force: true }).catch(() => {});
  };

  let localPath: string;
  let downloadedPath: string | null = null;
  if (source.kind === 'url') {
    downloadedPath = await downloadToTemp(source.url, '.zip', (loaded, total) => onProgress?.({ phase: 'download', loaded, total }));
    temps.push(downloadedPath);
    localPath = downloadedPath;
  } else {
    localPath = source.path;
  }

  // A matching file handed in directly (e.g. a bare .sfc or .pcm).
  if (matchExtensions.has(extname(localPath).toLowerCase())) {
    return { files: [localPath], extractedArchive: false, downloadedPath, cleanup };
  }

  // An archive, or any URL download (always attempted as an archive first).
  if (isArchive(localPath) || source.kind === 'url') {
    try {
      const dir = await extractArchiveToTemp(localPath, (extracted, total) => onProgress?.({ phase: 'extract', loaded: extracted, total }));
      temps.push(dir);
      return { files: await walkFiles(dir, matchExtensions), extractedArchive: true, downloadedPath, cleanup };
    } catch (err) {
      // A URL that isn't an archive at all: leave files empty and flag it so the
      // caller can fall back to treating downloadedPath as a raw file.
      if (source.kind === 'url') return { files: [], extractedArchive: false, downloadedPath, cleanup };
      await cleanup();
      throw err;
    }
  }

  await cleanup();
  throw new Error('Unsupported file type. Use .sfc, .smc, .zip, .7z, or .rar files.');
};

export { resolveSourceFiles };
export type { ImportSource, ResolvedSource, SourceProgress };
