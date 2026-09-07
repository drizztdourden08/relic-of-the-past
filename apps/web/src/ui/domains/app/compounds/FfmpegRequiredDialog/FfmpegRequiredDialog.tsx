/* @layer renderer-components @kind component */
/** One-shot gate in front of any ffmpeg-dependent action that has a fallback: shows the same
 *  install prompt MSU's audio conversion uses, then continues either way. Never blocks the
 *  caller on installing - skipping is always offered, because the caller degrades instead of
 *  failing outright (see debug-report packaging, which falls back to plain screenshots). */
import { useEffect, useRef } from 'react';
import { DialogShell } from '@ds/composites/DialogShell';
import { Button } from '@ds/primitives/Button';
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
