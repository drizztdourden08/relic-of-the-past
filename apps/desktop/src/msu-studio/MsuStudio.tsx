/* @layer renderer-components @kind component */
import { useEffect } from 'react';
import { StudioFrame } from '@app/compounds/StudioFrame';
import { useStudioActions } from './behavior/studio-frame/useStudioActions';
import { useStudioToolbar } from './behavior/studio-frame/useStudioToolbar';
import { EditorBody } from './studio-frame/EditorBody';
import { PackProperties } from './studio-frame/PackProperties';
import { StudioNotices } from './studio-frame/StudioNotices';
import { StudioStatus } from './studio-frame/StudioStatus';
import { TabPanels } from './studio-frame/TabPanels';
import {
  EDITOR_LABEL, IDLE_HINT, NO_PACK_TITLE, PACKS_PANEL_TITLE, PROPERTIES_PANEL_TITLE, STUDIO_CAPTION,
} from './studio-frame/studio-frame.constants';
import type { MsuStudioProps } from './MsuStudio.type';

const MsuStudio = (props: MsuStudioProps) => {
  const { msu, pack, readOnly, origin, list, tab, onTabChange, onDeleteConfirm } = props;
  const { onStopPreview, loadingFiles, handleExport } = msu;
  const openPack = loadingFiles ? null : pack;
  const open = openPack !== null;

  useEffect(() => {
    if (tab !== 'music') onStopPreview();
  }, [tab, onStopPreview]);

  const actions = useStudioActions({ hasPack: open, busy: msu.busy, exporting: msu.exporting, onExport: handleExport });
  const toolbar = useStudioToolbar({ tab, onTabChange });

  return (
    <StudioFrame
      caption={STUDIO_CAPTION}
      title={pack ?? NO_PACK_TITLE}
      status={open && <StudioStatus format={msu.format} readOnly={readOnly} />}
      groups={actions}
      idleHint={IDLE_HINT}
      notices={<StudioNotices message={msu.statusMessage} ok={msu.statusOk} />}
      banner={origin}
      left={{ title: PACKS_PANEL_TITLE, content: list }}
      right={openPack !== null ? {
        title: PROPERTIES_PANEL_TITLE,
        content: (
          <PackProperties
            pack={openPack}
            format={msu.format}
            slotCount={msu.rows.filter((row) => row.fileName !== null).length}
            fileCount={msu.files.length}
            totalSize={msu.totalSize}
            isDeluxe={msu.isDeluxe}
            hasOpuz={msu.hasOpuz}
            busy={msu.busy}
            readOnly={readOnly}
            onRename={msu.handleRenamePack}
          />
        ),
      } : undefined}
      editorLabel={EDITOR_LABEL}
      toolbar={open ? toolbar : undefined}
      className="msu-studio"
    >
      <EditorBody hasPack={pack !== null} loading={loadingFiles}>
        {openPack !== null && <TabPanels msu={msu} pack={openPack} readOnly={readOnly} tab={tab} onDeleteConfirm={onDeleteConfirm} />}
      </EditorBody>
    </StudioFrame>
  );
};

export { MsuStudio };
