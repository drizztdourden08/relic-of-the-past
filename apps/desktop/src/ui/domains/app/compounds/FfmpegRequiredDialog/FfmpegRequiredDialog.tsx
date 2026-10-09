/* @layer renderer-components @kind component */
import { useEffect, useRef } from 'react';
import { DialogShell } from '@drizztdourden08/tessera/composites';
import { Button } from '@drizztdourden08/tessera/primitives';
import { useFfmpegInstall } from '@app/hooks/useFfmpegInstall';
import { FfmpegInstallStep } from '../FfmpegInstallStep';
import type { FfmpegRequiredDialogProps } from './FfmpegRequiredDialog.type';

const FfmpegRequiredDialog = ({ open, onClose }: FfmpegRequiredDialogProps) => {
  const tool = useFfmpegInstall(open);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!open) { firedRef.current = false; return; }
    if (tool.state?.status === 'ready' && !firedRef.current) {
      firedRef.current = true;
      onClose();
    }
  }, [open, tool.state, onClose]);

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      title="Video capture tool"
      actions={<Button variant="tertiary" onClick={onClose}>Skip, send with images instead</Button>}
    >
      <FfmpegInstallStep state={tool.state} installing={tool.installing} onInstall={() => { void tool.install(); }} />
    </DialogShell>
  );
};

export { FfmpegRequiredDialog };
