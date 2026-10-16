/* @layer renderer-components @kind component */
import { MsuEffectsPanel } from '../MsuEffectsPanel';
import { MsuFilePanel } from '../MsuFilePanel';
import { MsuMusicTab } from '../MsuMusicTab';
import { MsuSoundPanel } from '../MsuSoundPanel';
import type { TabPanelsProps } from './studio-frame.type';

const TabPanels = (props: TabPanelsProps) => {
  const { msu, pack, readOnly, tab, onDeleteConfirm } = props;

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
    <>
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
    </>
  );
};

export { TabPanels };
