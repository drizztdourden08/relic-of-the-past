/* @layer renderer-components @kind component */
import { useState, useEffect } from 'react';
import { Text, Tabs } from '@drizztdourden08/tessera/primitives';
import { ScreenWindow } from '@drizztdourden08/tessera/composites';
import type { SpriteDebugProps, ReviewMode } from './SpriteDebug.type';
import { SpriteReviewPanel } from './sub-components/SpriteReviewPanel';
import { ItemReviewPanel } from './sub-components/ItemReviewPanel';
import { MODES } from './SpriteDebug.constants';
import { getSpritesBaseUrl } from '@app/storage/sprites-store';
import './SpriteDebug.css';

const SpriteDebug = (props: SpriteDebugProps) => {
  const { onClose, romFile } = props;
  const [mode, setMode] = useState<ReviewMode>('sprites');
  const [baseUrl, setBaseUrl] = useState('');
  useEffect(() => {
    if (!romFile) { setBaseUrl(''); return; }
    let cancelled = false;
    void getSpritesBaseUrl(romFile).then((u) => { if (!cancelled) setBaseUrl(u); });
    return () => { cancelled = true; };
  }, [romFile]);

  return (
    <ScreenWindow onClose={onClose} title="Sprite Debug">
      <Tabs tabs={MODES} activeTab={mode} onTabChange={(id) => setMode(id as ReviewMode)} />
      <Text className="sprite-debug-mode-hint">
        {mode === 'sprites'
          ? 'Does each extracted image look correct?'
          : 'Is each item mapped to the right sprite?'}
      </Text>
      {mode === 'sprites' ? <SpriteReviewPanel baseUrl={baseUrl} /> : <ItemReviewPanel baseUrl={baseUrl} />}
    </ScreenWindow>
  );
};

export { SpriteDebug };
