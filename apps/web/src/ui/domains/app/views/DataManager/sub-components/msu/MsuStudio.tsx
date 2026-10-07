/* @layer renderer-components @kind component */
/**
 * The selected pack's studio: its origin bar when it came from the Hookshop, then the music,
 * ambient, effects and files tabs. An installed pack is read only in every tab: it plays and
 * exports, and nothing that writes into it is on.
 */
import { useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Box } from '@ds/primitives/Box';
import { TabBar } from '@ds/primitives/TabBar';
import { MsuEffectsPanel } from './MsuEffectsPanel';
import { MsuFilePanel } from './MsuFilePanel';
import { MsuSoundPanel } from './MsuSoundPanel';
import { MsuTrackPanel } from './MsuTrackPanel';
import { STUDIO_TABS } from './sound-labels';
import type { StudioTab } from './sound-labels';
import type { MsuManagerModel } from './useMsuManager';

interface MsuStudioProps {
  msu: MsuManagerModel;
  pack: string;
  readOnly: boolean;
  /** The origin bar of an installed pack, or null for the player's own. */
  origin: ReactNode;
  /** Owned by the manager, so the tab holds while another pack loads. */
  tab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const MsuStudio = (props: MsuStudioProps) => {
  const { msu, pack, readOnly, origin, tab, onTabChange, onDeleteConfirm } = props;

  // A music audition is owned above the tabs, so leaving the music tab has to
  // silence it; the sound tabs stop themselves by unmounting.
  const { onStopPreview, handleDeleteFile } = msu;
  useEffect(() => {
    if (tab !== 'music') onStopPreview();
  }, [tab, onStopPreview]);

  const confirmDeleteFile = useCallback((fileName: string) => {
    onDeleteConfirm('Delete Audio File', `Delete "${fileName}" from this pack? This cannot be undone.`, () => {
      handleDeleteFile(fileName);
    });
  }, [onDeleteConfirm, handleDeleteFile]);

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
      <TabBar tabs={STUDIO_TABS} activeTab={tab} onTabChange={(id) => onTabChange(id as StudioTab)} />
      {tab === 'ambient' && <MsuSoundPanel channel="ambient" {...soundProps} />}
      {/* Both effect ports, one section each. See MsuEffectsPanel for why they are not merged. */}
      {tab === 'effects' && <MsuEffectsPanel {...soundProps} />}
      {tab === 'files' && (
        // saveBase is the pack's OWN manifest: a rename must not hand a classic pack one.
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
      {tab === 'music' && (
        <MsuTrackPanel
          selected={pack}
          files={msu.files}
          manifest={msu.resolved}
          saveBase={msu.manifest ?? msu.resolved}
          format={msu.format}
          totalSize={msu.totalSize}
          isDeluxe={msu.isDeluxe}
          hasOpuz={msu.hasOpuz}
          rows={msu.rows}
          unusedFiles={msu.unusedFiles}
          fileOptions={msu.fileOptions}
          playing={msu.playing}
          reportStore={msu.reportStore}
          openTrack={msu.openTrack}
          busy={msu.busy}
          readOnly={readOnly}
          exporting={msu.exporting}
          statusMessage={msu.statusMessage}
          statusOk={msu.statusOk}
          onTrackAssign={msu.handleTrackAssign}
          onTrackUpload={msu.handleTrackUpload}
          onToggleLayers={msu.handleToggleLayers}
          onPreview={msu.onPreview}
          onStopPreview={msu.onStopPreview}
          onRename={msu.handleRenamePack}
          onExport={msu.handleExport}
          onDeleteFile={confirmDeleteFile}
          onConfirm={onDeleteConfirm}
          onReload={msu.reload}
        />
      )}
    </Box>
  );
};

export { MsuStudio };
export type { MsuStudioProps };
