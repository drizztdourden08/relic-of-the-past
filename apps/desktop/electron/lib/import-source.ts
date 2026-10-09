/* @layer electron-main @kind logic */
import { extname } from 'path';
import { rm } from 'fs/promises';
import { extractArchiveToTempDir, walkFiles } from './archive';
import { downloadToTempFile } from './download';
import { ARCHIVE_EXTENSIONS } from './extensions';
import type { ImportSource, ResolvedSource, SourceProgress } from './import-source.type';

const isArchive = (filePath: string): boolean =>
  ARCHIVE_EXTENSIONS.has(extname(filePath).toLowerCase());

const resolveSourceFiles = async (source: ImportSource, matchExtensions: Set<string>, onProgress?: SourceProgress): Promise<ResolvedSource> => {
  const temps: string[] = [];
  const cleanup = async (): Promise<void> => {
    for (const t of temps) await rm(t, { recursive: true, force: true }).catch(() => {});
  };

  let localPath: string;
  let downloadedPath: string | null = null;
  if (source.kind === 'url') {
    downloadedPath = await downloadToTempFile(source.url, '.zip', (loaded, total) => onProgress?.({ phase: 'download', loaded, total }));
    temps.push(downloadedPath);
    localPath = downloadedPath;
  } else {
    localPath = source.path;
  }

  const isMatchingFile = matchExtensions.has(extname(localPath).toLowerCase());
  if (isMatchingFile) {
    return { files: [localPath], extractedArchive: false, downloadedPath, cleanup };
  }

  if (isArchive(localPath) || source.kind === 'url') {
    try {
      const dir = await extractArchiveToTempDir(localPath, (extracted, total) => onProgress?.({ phase: 'extract', loaded: extracted, total }));
      temps.push(dir);
      return { files: await walkFiles(dir, matchExtensions), extractedArchive: true, downloadedPath, cleanup };
    } catch (err) {
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
