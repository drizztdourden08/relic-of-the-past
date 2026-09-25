/* @layer sanctuary-site @kind hook */
/**
 * Downloads several files at once. Up to the zip limit they are read into one zip built
 * in the browser, with a progress bar over the bytes read and then the zip written. Past
 * it, each file is saved on its own, one after another with a short pause, so the
 * browser is never asked to hold them all in memory.
 */
import { useCallback, useState } from 'react';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { downloadFile } from '../../../api/files-endpoints';
import { errorMessage } from '../../../api/client';
import { BATCH_SAVE_GAP_MS } from '../Files.constants';
import { fitsInZip, totalBytes } from './batch-size';
import { saveBlob, saveUrl } from './save-link';
import { uniqueNames } from './unique-names';
import { zipFiles } from './zip-files';

type DownloadStatus = {
  running: boolean;
  /** 0 to 100. */
  percent: number;
  /** What is happening, or how it ended; null before the first download. */
  label: string | null;
  failed: boolean;
  /** The pick the last download was for (`pickKeyOf`), so its result is not shown under another. */
  pickKey: string;
};

const IDLE: DownloadStatus = { running: false, percent: 0, label: null, failed: false, pickKey: '' };

const pickKeyOf = (files: readonly SanctuaryFile[]) => files.map((file) => file.id).join(' ');

const pause = (ms: number) => new Promise<void>((resolve) => { setTimeout(resolve, ms); });

const zipNameOf = (count: number) => `sanctuary-${count}-files.zip`;

const useBatchDownload = () => {
  const [status, setStatus] = useState(IDLE);

  /* Called per chunk read; only a new whole percent re-renders. */
  const show = useCallback((percent: number, label: string) => {
    const whole = Math.min(100, Math.floor(percent));
    setStatus((s) => (s.percent === whole && s.label === label ? s : { ...s, running: true, percent: whole, label }));
  }, []);

  const zipAll = useCallback(async (files: readonly SanctuaryFile[]) => {
    const bytes = Math.max(1, totalBytes(files));
    const names = uniqueNames(files.map((file) => file.name));
    const entries = files.map((file, i) => ({
      name: names[i],
      url: async () => (await downloadFile(file.id)).url,
    }));
    const blob = await zipFiles(entries, ({ read, packing }) => {
      if (packing === null) show((read / bytes) * 100, 'Reading files...');
      else show(packing, 'Writing the zip...');
    });
    saveBlob(blob, zipNameOf(files.length));
    return `Saved ${files.length} files as one zip.`;
  }, [show]);

  const oneByOne = useCallback(async (files: readonly SanctuaryFile[]) => {
    for (const [i, file] of files.entries()) {
      show((i / files.length) * 100, `Saving ${i + 1} of ${files.length}...`);
      saveUrl((await downloadFile(file.id)).url);
      await pause(BATCH_SAVE_GAP_MS);
    }
    return `Started ${files.length} downloads, one per file.`;
  }, [show]);

  const download = useCallback(async (files: readonly SanctuaryFile[]) => {
    const pickKey = pickKeyOf(files);
    setStatus({ ...IDLE, running: true, label: 'Starting...', pickKey });
    try {
      const label = await (fitsInZip(files) ? zipAll(files) : oneByOne(files));
      setStatus({ running: false, percent: 100, label, failed: false, pickKey });
    } catch (cause) {
      setStatus({ running: false, percent: 0, label: errorMessage(cause), failed: true, pickKey });
    }
  }, [zipAll, oneByOne]);

  return { ...status, download };
};

type BatchDownload = ReturnType<typeof useBatchDownload>;

export { useBatchDownload, pickKeyOf };
export type { BatchDownload, DownloadStatus };
