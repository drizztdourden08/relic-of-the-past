/* @layer renderer-components @kind component */
import { useEffect, useRef } from 'react';
import { DialogShell } from '@drizztdourden08/tessera/composites';
import { Button } from '@drizztdourden08/tessera/primitives';
import { useTool } from '@drizztdourden08/brock-tools/renderer';
import { FFMPEG_TOOL_ID } from '@app/ffmpeg-tool';
import { FfmpegInstallStep } from '../FfmpegInstallStep';
import type { FfmpegRequiredDialogProps } from './FfmpegRequiredDialog.type';

const FfmpegRequiredDialog = ({ open, onClose }: FfmpegRequiredDialogProps) => {
  const tool = useTool(FFMPEG_TOOL_ID);
  const { refresh } = tool;
  const firedRef = useRef(false);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

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
      <FfmpegInstallStep
        state={tool.state}
        installing={tool.installing}
        error={tool.error}
        onInstall={() => { void tool.install(); }}
      />
    </DialogShell>
  );
};

export { FfmpegRequiredDialog };
