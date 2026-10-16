/* @layer renderer-components @kind component */
import { MsuEffectsPanel } from '../MsuEffectsPanel';
import { MsuFilePanel } from '../MsuFilePanel';
import { MsuMusicTab } from '../MsuMusicTab';
import { MsuSoundPanel } from '../MsuSoundPanel';
import type { TabPanelsProps } from './studio-frame.type';

const TabPanels = (props: TabPanelsProps) => {
  const { msu, pack, readOnly, tab, tabs, packPanel, onDeleteConfirm } = props;

  const soundProps = {
    pack,
    manifest: msu.resolved,
    saveBase: msu.manifest ?? msu.resolved,
    files: msu.files,
    isLayered: msu.format === 'layered',
    readOnly,
    tabs,
    packPanel,
    onDeleteConfirm,
    onReload: msu.reload,
  };

  if (tab === 'ambient') return <MsuSoundPanel channel="ambient" {...soundProps} />;
  if (tab === 'effects') return <MsuEffectsPanel {...soundProps} />;
  if (tab === 'files') {
    return (
      <MsuFilePanel
        pack={pack}
        manifest={msu.resolved}
        saveBase={msu.manifest}
        files={msu.files}
        readOnly={readOnly}
        tabs={tabs}
        packPanel={packPanel}
        onDeleteConfirm={onDeleteConfirm}
        onReload={msu.reload}
      />
    );
  }
  return <MsuMusicTab msu={msu} pack={pack} readOnly={readOnly} tabs={tabs} packPanel={packPanel} onDeleteConfirm={onDeleteConfirm} />;
};

export { TabPanels };
