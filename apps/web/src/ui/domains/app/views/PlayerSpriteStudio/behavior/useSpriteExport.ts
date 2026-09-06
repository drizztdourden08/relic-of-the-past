/* @layer renderer-hooks @kind logic */
/**
 * Send a sheet out of the app as a file.
 *
 * Serializing and choosing a destination are separate concerns: the container decides the
 * bytes, and the platform decides how a file reaches the user: a save dialog on desktop,
 * a share sheet on mobile, a download in a browser. This hook joins the two and reports
 * what happened, since a cancelled dialog is a normal outcome, not a failure.
 */
import { useState, useCallback } from 'react';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import { getPlatform } from '@app/platform/get-platform';
import { toZsprBytes } from '@app/lib/game/zspr-write';
import { toRspBytes } from '@app/lib/game/rsp';
import { safeFileName } from '@app/lib/storage/link-sprites-store';

type Container = 'zspr' | 'rsp';

const useSpriteExport = () => {
  const [status, setStatus] = useState<string>('');

  const exportSheet = useCallback(async (sheet: PlayerSheet, container: Container) => {
    const name = safeFileName(`${sheet.meta.name || 'sprite'}.${container}`);
    const bytes = container === 'rsp' ? await toRspBytes(sheet) : toZsprBytes(sheet);
    const result = await getPlatform().filePicker.saveFile({ name, bytes, extensions: [container] });
    setStatus(result.saved ? `Exported ${result.name ?? name}` : result.error ?? 'Export cancelled');
    return result.saved;
  }, []);

  return { exportSheet, status, clearStatus: useCallback(() => setStatus(''), []) };
};

export { useSpriteExport };
export type { Container };
