/* @layer sanctuary-site @kind hook */
import { useCallback, useState } from 'react';
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { downloadFile } from '../../../endpoints/files-endpoints';
import { errorMessage } from '@rotp/hub-client';
import { BATCH_SAVE_GAP_MS } from '../Files.constants';
import { fitsInZip, totalBytes } from './batch-size';
import { pickKeyOf } from './pick-key-of';
import { saveBlob, saveUrl } from './save-link';
import { uniqueNames } from './unique-names';
import { zipFiles } from './zip-files';
import { IDLE } from './useBatchDownload.constants';

const pause = (ms: number) => new Promise<void>((resolve) => { setTimeout(resolve, ms); });

const zipNameOf = (count: number) => `sanctuary-${count}-files.zip`;

const useBatchDownload = () => {
  const [status, setStatus] = useState(IDLE);

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

export { useBatchDownload };
