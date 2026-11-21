/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { UploadField } from '@app/compounds/UploadField';
import { useT } from '@drizztdourden08/brock-react';
import { fileToolGroups } from './file-tool-groups';
import { FileList } from './FileList';
import { FilesSummary } from './FilesSummary';
import { StudioDetailsLayout } from './StudioDetailsLayout';
import { OptimizeDialog } from './OptimizeDialog';
import { useFilePanelModel } from './behavior/useFilePanelModel';
import { AUDIO_ACCEPT } from './msu.constants';
import type { MsuFilePanelProps } from './MsuFilePanel.type';

const MsuFilePanel = (props: MsuFilePanelProps) => {
  const { pack, readOnly, tabs, packPanel, onReload } = props;
  const t = useT();
  const model = useFilePanelModel(props);
  const { panel, covered, usage, supersededOnly } = model;
  const [optimizing, setOptimizing] = useState(false);

  const toolbar = fileToolGroups({
    t,
    tabs,
    filter: panel.filter,
    coveredCount: covered.count,
    supersededOnly,
    onFilterChange: panel.setFilter,
    onSupersededOnlyChange: model.setSupersededOnly,
  });

  const detail = <><FilesSummary model={model} readOnly={readOnly} onOptimize={() => setOptimizing(true)} />{packPanel}</>;

  return (
    <StudioDetailsLayout editorLabel={t('msu-studio:studio.editor.files')} toolbar={toolbar} detail={detail}>
      <Box className="msu-panel">
        <UploadField
          variant="block"
          accept={AUDIO_ACCEPT}
          label={t('msu-studio:files.drop')}
          hint={t('msu-studio:files.accept-hint')}
          disabled={panel.busy || readOnly}
          onFiles={panel.handleUpload}
        />
        {panel.statusMessage != null && (
          <Text className={`msu-status${panel.statusOk ? '' : ' msu-status--error'}`}>{panel.statusMessage}</Text>
        )}
        <FileList
          ready={panel.ready}
          shown={model.shown}
          fileCount={panel.metadata.length}
          supersededOnly={supersededOnly}
          filter={panel.filter}
          usage={usage}
          audition={model.audition}
          busy={panel.busy}
          readOnly={readOnly}
          onRename={panel.renameFile}
          onDelete={model.confirmDelete}
        />
      </Box>
      <OptimizeDialog open={optimizing} pack={pack} onClose={() => setOptimizing(false)} onConverted={onReload} />
    </StudioDetailsLayout>
  );
};

export { MsuFilePanel };
