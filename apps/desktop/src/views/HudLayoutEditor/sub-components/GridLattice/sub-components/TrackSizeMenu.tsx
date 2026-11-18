/* @layer renderer-components @kind component */
import { DropdownMenu } from '@drizztdourden08/tessera/composites';
import { EXTENT_MODES, extentFor } from '@app/hud-layout-editing/track-extents';
import type { TrackSizeMenuProps } from './TrackSizeMenu.type';
import { useText } from '@drizztdourden08/brock-react';

const TrackSizeMenu = (props: TrackSizeMenuProps) => {
  const text = useText();
  const { anchorRef, mode, extent, onSize, onClose } = props;

  return (
    <DropdownMenu
      anchorRef={anchorRef}
      align="start"
      onClose={onClose}
      groups={[{
        id: 'modes',
        items: EXTENT_MODES.map((entry) => ({
          id: entry.mode,
          label: text(entry.label),
          kind: 'radio' as const,
          checked: entry.mode === mode,
          onSelect: () => { onClose(); onSize?.(extentFor(entry.mode, extent)); },
        })),
      }]}
    />
  );
};

export { TrackSizeMenu };
