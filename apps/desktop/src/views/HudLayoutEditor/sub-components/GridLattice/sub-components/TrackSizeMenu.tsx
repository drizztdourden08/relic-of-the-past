/* @layer renderer-components @kind component */
import { DropdownMenu } from '@drizztdourden08/tessera/composites';
import { EXTENT_MODES, extentFor } from '@app/hud-layout-editing/track-extents';
import type { TrackSizeMenuProps } from './TrackSizeMenu.type';

const TrackSizeMenu = (props: TrackSizeMenuProps) => {
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
          label: entry.label,
          kind: 'radio' as const,
          checked: entry.mode === mode,
          onSelect: () => { onClose(); onSize?.(extentFor(entry.mode, extent)); },
        })),
      }]}
    />
  );
};

export { TrackSizeMenu };
