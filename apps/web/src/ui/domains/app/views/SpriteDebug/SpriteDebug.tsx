/* @layer renderer-components @kind component */
import { useState, useEffect } from 'react';
import { Text, TabBar } from '../../../../design-system/primitives';
import { FullScreenLayer } from '../../../../design-system/composites/FullScreenLayer';
import type { SpriteDebugProps, ReviewMode } from './SpriteDebug.type';
import { SpriteReviewPanel } from './sub-components/SpriteReviewPanel';
import { ItemReviewPanel } from './sub-components/ItemReviewPanel';
import { S } from './SpriteDebug.constants';
import { getSpritesBaseUrl } from '@app/lib/storage/sprites-store';

const MODES = [
  { id: 'sprites', label: 'Sprite Review' },
  { id: 'items', label: 'Item Association' },
];

const SpriteDebug = (props: SpriteDebugProps) => {
  const { onClose, romFile } = props;
  const [mode, setMode] = useState<ReviewMode>('sprites');
  const [baseUrl, setBaseUrl] = useState('');
  useEffect(() => {
    if (!romFile) { setBaseUrl(''); return; }
    let cancelled = false;
    getSpritesBaseUrl(romFile).then((u) => { if (!cancelled) setBaseUrl(u); });
    return () => { cancelled = true; };
  }, [romFile]);

  return (
    <FullScreenLayer onClose={onClose} title="Sprite Debug">
      <TabBar tabs={MODES} activeTab={mode} onTabChange={(id) => setMode(id as ReviewMode)} />
      <Text style={S.modeHint}>
        {mode === 'sprites'
          ? 'Does each extracted image look correct?'
          : 'Is each item mapped to the right sprite?'}
      </Text>
      {mode === 'sprites' ? <SpriteReviewPanel baseUrl={baseUrl} /> : <ItemReviewPanel baseUrl={baseUrl} />}
    </FullScreenLayer>
  );
};

export { SpriteDebug };
