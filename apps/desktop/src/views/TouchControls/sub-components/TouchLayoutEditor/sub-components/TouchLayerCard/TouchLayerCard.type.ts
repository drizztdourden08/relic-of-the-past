/* @layer renderer-app @kind types */
import type { TouchSharedDraft } from '../../TouchLayoutEditor.state.type';

interface TouchLayerCardProps {
  shared: TouchSharedDraft;
  onChange: (patch: Partial<TouchSharedDraft>) => void;
  onReset: () => void;
}

export type { TouchLayerCardProps };
