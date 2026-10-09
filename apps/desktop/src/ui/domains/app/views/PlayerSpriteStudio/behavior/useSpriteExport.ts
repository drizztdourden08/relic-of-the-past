/* @layer renderer-hooks @kind logic */
import { useState, useCallback } from 'react';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import { getPlatform } from '@drizztdourden08/brock-react';
import { toZsprBytes } from '@app/lib/game/zspr-write';
import { toRspBytes } from '@app/lib/game/rsp';
import { safeFileName } from '@shared/storage/link-sprites/link-sprites';
import type { Container } from '../PlayerSpriteStudio.type';

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
