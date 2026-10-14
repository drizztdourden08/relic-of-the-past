/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { trackText } from '@app/hud-layout-editing/track-extents';
import { emptyOn } from '../behavior/empty-on';
import { headTitle } from '../behavior/head-title';
import { AddTrackButton } from './AddTrackButton';
import { TrackHead } from './TrackHead';
import type { LatticeHeaderProps } from './LatticeHeader.type';

const LatticeHeader = (props: LatticeHeaderProps) => {
  const { columns, colSizes, trackOn, onCornerDown, onTrackDown, onSizeTrack, onAddTrack, extentOf } = props;

  return (
    <Box className="hud-lattice__line" role="row">
      <Box
        className="hud-lattice__corner"
        role="columnheader"
        aria-label={onCornerDown ? 'Select every cell' : 'Grid'}
        data-inert={onCornerDown ? undefined : 'true'}
        onPointerDown={onCornerDown}
      />
      {columns.map((track, index) => (
        <TrackHead
          key={index}
          axis="columns"
          index={index}
          text={trackText(track)}
          extent={extentOf?.('columns', index)}
          selected={trackOn('columns', index)}
          empty={emptyOn(colSizes, index)}
          title={headTitle('column', index + 1, trackText(track), emptyOn(colSizes, index))}
          onPointerDown={onTrackDown ? (event) => onTrackDown('columns', index, event) : undefined}
          onSize={onSizeTrack ? (extent) => onSizeTrack('columns', index, extent) : undefined}
        />
      ))}
      {onAddTrack && (
        <AddTrackButton axis="columns" at={columns.length + 2} onAdd={() => onAddTrack('columns')} />
      )}
    </Box>
  );
};

export { LatticeHeader };
