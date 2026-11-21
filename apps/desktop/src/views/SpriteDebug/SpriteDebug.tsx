/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { useState, useEffect } from 'react';
import { Text, Tabs } from '@drizztdourden08/tessera/primitives';
import type { SpriteDebugProps, ReviewMode } from './SpriteDebug.type';
import { SpriteReviewPanel } from './sub-components/SpriteReviewPanel';
import { ItemReviewPanel } from './sub-components/ItemReviewPanel';
import { modesOf } from './SpriteDebug.constants';
import { getSpritesBaseUrl } from '@app/storage/sprites-store';
import './SpriteDebug.css';

const SpriteDebug = (props: SpriteDebugProps) => {
  const t = useT();
  const { romFile } = props;
  const [mode, setMode] = useState<ReviewMode>('sprites');
  const [baseUrl, setBaseUrl] = useState('');
  useEffect(() => {
    if (!romFile) { setBaseUrl(''); return; }
    let cancelled = false;
    void getSpritesBaseUrl(romFile).then((u) => { if (!cancelled) setBaseUrl(u); });
    return () => { cancelled = true; };
  }, [romFile]);

  return (
    <>
      <Tabs tabs={modesOf(t)} activeTab={mode} onTabChange={(id) => setMode(id as ReviewMode)} />
      <Text className="sprite-debug-mode-hint">
        {mode === 'sprites'
          ? t('views-sprite-debug:hint.sprites')
          : t('views-sprite-debug:hint.items')}
      </Text>
      {mode === 'sprites' ? <SpriteReviewPanel baseUrl={baseUrl} /> : <ItemReviewPanel baseUrl={baseUrl} />}
    </>
  );
};

export { SpriteDebug };
