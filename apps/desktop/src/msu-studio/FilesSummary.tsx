/* @layer renderer-components @kind component */
import { StudioSection } from '@app/studio';
import { PackSummary } from './PackSummary';
import { EMPTY_PACK } from './MsuFilePanel.constants';
import type { FilesSummaryProps } from './FilesSummary.type';

const FilesSummary = (props: FilesSummaryProps) => {
  const { model, readOnly, onOptimize } = props;
  const { panel, covered } = model;

  return (
    <StudioSection title="Files">
      <PackSummary
        fileCount={panel.metadata.length}
        totalSize={panel.totalSize}
        formats={panel.formats}
        unusedCount={model.unusedCount}
        supersededCount={covered.count}
        supersededBytes={covered.totalBytes}
        optimizeBlockedBecause={panel.metadata.length === 0 ? EMPTY_PACK : null}
        busy={panel.busy || covered.removing || readOnly}
        onOptimize={onOptimize}
        onRemoveSuperseded={model.confirmRemoveSuperseded}
      />
    </StudioSection>
  );
};

export { FilesSummary };
