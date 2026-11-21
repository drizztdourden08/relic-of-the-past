/* @layer renderer-hooks @kind logic */
import { useState, useCallback } from 'react';
import type { PlayerSheet } from '@rotp/game-data';
import { useT } from '@drizztdourden08/brock-react';
import { getPlatform } from '@drizztdourden08/brock-react';
import { toZsprBytes, toRspBytes, safeFileName } from '@rotp/packs';
import type { Container } from '../PlayerSpriteStudio.type';

const useSpriteExport = () => {
  const t = useT();
  const [status, setStatus] = useState<string>('');

  const exportSheet = useCallback(async (sheet: PlayerSheet, container: Container) => {
    const name = safeFileName(`${sheet.meta.name || 'sprite'}.${container}`);
    const bytes = container === 'rsp' ? await toRspBytes(sheet) : toZsprBytes(sheet);
    const result = await getPlatform().filePicker.saveFile({ name, bytes, extensions: [container] });
    setStatus(result.saved ? t('views-player-sprite-studio:export.done', { name: result.name ?? name }) : result.error ?? t('views-player-sprite-studio:export.cancelled'));
    return result.saved;
  }, [t]);

  return { exportSheet, status, clearStatus: useCallback(() => setStatus(''), []) };
};

export { useSpriteExport };
