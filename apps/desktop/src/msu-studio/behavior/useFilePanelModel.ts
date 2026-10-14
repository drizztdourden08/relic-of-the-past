/* @layer renderer-components @kind hook */
import { useMemo, useState } from 'react';
import type { MsuFilePanelProps } from '../MsuFilePanel.type';
import { useFileAudition } from './useFileAudition';
import { useFileConfirms } from './useFileConfirms';
import { useFilePanel } from './useFilePanel';
import { useFileUsage } from './useFileUsage';
import { useSupersededFiles } from './useSupersededFiles';

const useFilePanelModel = (props: MsuFilePanelProps) => {
  const { pack, manifest, saveBase, files, onDeleteConfirm, onReload } = props;
  const panel = useFilePanel({ pack, files, saveBase, reload: onReload });
  const audition = useFileAudition(pack, files);
  const usage = useFileUsage(manifest);
  const covered = useSupersededFiles({ pack, files, saveBase, reload: onReload });
  const { metadata, rows, deleteFile, report } = panel;
  const [supersededOnly, setSupersededOnly] = useState(false);
  const { confirmDelete, confirmRemoveSuperseded } = useFileConfirms({ usage, covered, onDeleteConfirm, deleteFile, report });

  const unusedCount = useMemo(
    () => metadata.filter((file) => !usage.has(file.name)).length,
    [metadata, usage],
  );

  const shown = useMemo(
    () => (supersededOnly ? rows.filter((file) => covered.superseded.has(file.name)) : rows),
    [rows, supersededOnly, covered.superseded],
  );

  return {
    panel, audition, usage, covered, supersededOnly, setSupersededOnly,
    confirmDelete, confirmRemoveSuperseded, unusedCount, shown,
  };
};

export { useFilePanelModel };
