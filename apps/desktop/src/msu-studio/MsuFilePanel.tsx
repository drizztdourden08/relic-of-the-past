/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, DropZone, Text } from '@drizztdourden08/tessera/primitives';
import { StudioBody } from '@app/studio';
import { FileControls } from './FileControls';
import { FileList } from './FileList';
import { FilesSummary } from './FilesSummary';
import { OptimizeDialog } from './OptimizeDialog';
import { useFilePanelModel } from './behavior/useFilePanelModel';
import { AUDIO_ACCEPT, AUDIO_ACCEPT_HINT } from './msu.constants';
import { DETAILS_PANEL, EDITOR_LABELS } from './studio-frame/studio-frame.constants';
import type { MsuFilePanelProps } from './MsuFilePanel.type';

const MsuFilePanel = (props: MsuFilePanelProps) => {
  const { pack, readOnly, tabs, packPanel, onReload } = props;
  const model = useFilePanelModel(props);
  const { panel, covered, usage, supersededOnly } = model;
  const [optimizing, setOptimizing] = useState(false);

  const toolbar = (
    <>
      {tabs}
      <FileControls
        filter={panel.filter}
        coveredCount={covered.count}
        supersededOnly={supersededOnly}
        onFilterChange={panel.setFilter}
        onSupersededOnlyChange={model.setSupersededOnly}
      />
    </>
  );

  const detail = <><FilesSummary model={model} readOnly={readOnly} onOptimize={() => setOptimizing(true)} />{packPanel}</>;

  return (
    <StudioBody editorLabel={EDITOR_LABELS.files} toolbar={toolbar} end={{ ...DETAILS_PANEL, content: detail }}>
      <Box className="msu-panel">
        <DropZone
          accept={AUDIO_ACCEPT}
          label="Drop audio here to add it to the pack"
          hint={AUDIO_ACCEPT_HINT}
          disabled={panel.busy || readOnly}
          onDrop={panel.handleUpload}
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
    </StudioBody>
  );
};

export { MsuFilePanel };
