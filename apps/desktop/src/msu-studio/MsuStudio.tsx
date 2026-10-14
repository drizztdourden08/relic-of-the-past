/* @layer renderer-components @kind component */
import { useEffect } from 'react';
import { Box, Tabs } from '@drizztdourden08/tessera/primitives';
import { MsuEffectsPanel } from './MsuEffectsPanel';
import { MsuFilePanel } from './MsuFilePanel';
import { MsuMusicTab } from './MsuMusicTab';
import { MsuSoundPanel } from './MsuSoundPanel';
import { STUDIO_TABS } from './sound-labels';
import type { StudioTab } from './sound-labels';
import type { MsuStudioProps } from './MsuStudio.type';

const MsuStudio = (props: MsuStudioProps) => {
  const { msu, pack, readOnly, origin, tab, onTabChange, onDeleteConfirm } = props;

  const { onStopPreview } = msu;
  useEffect(() => {
    if (tab !== 'music') onStopPreview();
  }, [tab, onStopPreview]);

  const soundProps = {
    pack,
    manifest: msu.resolved,
    saveBase: msu.manifest ?? msu.resolved,
    files: msu.files,
    isLayered: msu.format === 'layered',
    readOnly,
    onDeleteConfirm,
    onReload: msu.reload,
  };

  return (
    <Box className="msu-studio">
      {origin}
      <Tabs tabs={STUDIO_TABS} activeTab={tab} onTabChange={(id) => onTabChange(id as StudioTab)} />
      {tab === 'ambient' && <MsuSoundPanel channel="ambient" {...soundProps} />}
      {tab === 'effects' && <MsuEffectsPanel {...soundProps} />}
      {tab === 'files' && (
        <MsuFilePanel
          pack={pack}
          manifest={msu.resolved}
          saveBase={msu.manifest}
          files={msu.files}
          readOnly={readOnly}
          onDeleteConfirm={onDeleteConfirm}
          onReload={msu.reload}
        />
      )}
      {tab === 'music' && <MsuMusicTab msu={msu} pack={pack} readOnly={readOnly} onDeleteConfirm={onDeleteConfirm} />}
    </Box>
  );
};

export { MsuStudio };
