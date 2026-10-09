/* @layer renderer-components @kind types */
import type { SoundChannel } from '@rotp/game-data';
import type { LayerEditorProps } from './LayerEditor';

interface SoundDetailProps extends LayerEditorProps {
  channel: SoundChannel;
  soundId: number;
  syncGroup: string | undefined;
  unclaimed: boolean;
  uploading: boolean;
  onUpload: (files: File[]) => void;
}

export type { SoundDetailProps };
