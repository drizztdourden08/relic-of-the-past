/* @layer renderer-components @kind component */
import { useEffect } from 'react';
import { Center, Spinner } from '@drizztdourden08/tessera/primitives';
import { StudioPane } from '@app/studio';
import { useStudioActions } from './behavior/studio-frame/useStudioActions';
import { PackProperties } from './studio-frame/PackProperties';
import { SectionTabs } from './studio-frame/SectionTabs';
import { StudioNotices } from './studio-frame/StudioNotices';
import { TabPanels } from './studio-frame/TabPanels';
import { STUDIO_LABEL } from './studio-frame/studio-frame.constants';
import type { MsuStudioProps } from './MsuStudio.type';

const MsuStudio = (props: MsuStudioProps) => {
  const { msu, pack, readOnly, origin, tab, onTabChange, onDeleteConfirm } = props;
  const { onStopPreview, loadingFiles, handleExport } = msu;

  useEffect(() => {
    if (tab !== 'music') onStopPreview();
  }, [tab, onStopPreview]);

  const actions = useStudioActions({ busy: msu.busy, exporting: msu.exporting, onExport: handleExport });

  if (loadingFiles) return <Center><Spinner /></Center>;

  const packPanel = (
    <PackProperties
      pack={pack}
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
  );

  return (
    <StudioPane
      label={STUDIO_LABEL}
      actions={actions}
      status={<StudioNotices message={msu.statusMessage} ok={msu.statusOk} />}
      banner={origin}
    >
      <TabPanels
        msu={msu}
        pack={pack}
        readOnly={readOnly}
        tab={tab}
        tabs={<SectionTabs tab={tab} onTabChange={onTabChange} />}
        packPanel={packPanel}
        onDeleteConfirm={onDeleteConfirm}
      />
    </StudioPane>
  );
};

export { MsuStudio };
