/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, SectionHeader } from '@drizztdourden08/tessera/primitives';
import { FileControls } from './FileControls';
import { FileList } from './FileList';
import { PackSummary } from './PackSummary';
import { OptimizeDialog } from './OptimizeDialog';
import { useFilePanelModel } from './behavior/useFilePanelModel';
import { EMPTY_PACK } from './MsuFilePanel.constants';
import type { MsuFilePanelProps } from './MsuFilePanel.type';

const MsuFilePanel = (props: MsuFilePanelProps) => {
  const { pack, readOnly, onReload } = props;
  const model = useFilePanelModel(props);
  const { panel, covered, usage, supersededOnly } = model;
  const [optimizing, setOptimizing] = useState(false);

  return (
    <Box className="msu-panel">
      <SectionHeader
        title="Files"
        subtitle="Every audio file in the pack. Any slot or sound can draw on any of them, so a file is not owned by the row that plays it."
      />

      <PackSummary
        fileCount={panel.metadata.length}
        totalSize={panel.totalSize}
        formats={panel.formats}
        unusedCount={model.unusedCount}
        supersededCount={covered.count}
        supersededBytes={covered.totalBytes}
        optimizeBlockedBecause={panel.metadata.length === 0 ? EMPTY_PACK : null}
        busy={panel.busy || covered.removing || readOnly}
        onOptimize={() => setOptimizing(true)}
        onRemoveSuperseded={model.confirmRemoveSuperseded}
      />

      <FileControls
        panel={panel}
        coveredCount={covered.count}
        supersededOnly={supersededOnly}
        readOnly={readOnly}
        onSupersededOnlyChange={model.setSupersededOnly}
      />

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

      <OptimizeDialog
        open={optimizing}
        pack={pack}
        onClose={() => setOptimizing(false)}
        onConverted={onReload}
      />
    </Box>
  );
};

export { MsuFilePanel };
