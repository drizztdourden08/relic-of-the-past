/* @layer renderer-components @kind component */
import { StudioSection } from '@app/studio';
import { useT } from '@drizztdourden08/brock-react';
import { PackSummary } from './PackSummary';
import type { FilesSummaryProps } from './FilesSummary.type';

const FilesSummary = (props: FilesSummaryProps) => {
  const { model, readOnly, onOptimize } = props;
  const { panel, covered } = model;
  const t = useT();

  return (
    <StudioSection title={t('msu-studio:files.title')}>
      <PackSummary
        fileCount={panel.metadata.length}
        totalSize={panel.totalSize}
        formats={panel.formats}
        unusedCount={model.unusedCount}
        supersededCount={covered.count}
        supersededBytes={covered.totalBytes}
        optimizeBlockedBecause={panel.metadata.length === 0 ? t('msu-studio:files.empty-pack') : null}
        busy={panel.busy || covered.removing || readOnly}
        onOptimize={onOptimize}
        onRemoveSuperseded={model.confirmRemoveSuperseded}
      />
    </StudioSection>
  );
};

export { FilesSummary };
