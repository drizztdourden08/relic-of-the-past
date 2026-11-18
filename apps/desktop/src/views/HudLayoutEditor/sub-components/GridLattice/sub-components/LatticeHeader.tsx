/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { trackText } from '@app/hud-layout-editing/track-extents';
import { emptyOn } from '../behavior/empty-on';
import { headTitle } from '../behavior/head-title';
import { AddTrackButton } from './AddTrackButton';
import { TrackHead } from './TrackHead';
import type { LatticeHeaderProps } from './LatticeHeader.type';
import { useT } from '@drizztdourden08/brock-react';

const LatticeHeader = (props: LatticeHeaderProps) => {
  const t = useT();
  const { columns, colSizes, trackOn, onCornerDown, onTrackDown, onSizeTrack, onAddTrack, extentOf } = props;

  return (
    <Box className="hud-lattice__line" role="row">
      <Box
        className="hud-lattice__corner"
        role="columnheader"
        aria-label={onCornerDown ? t('hud-editor:lattice.select-all') : t('hud-editor:lattice.grid')}
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
          title={headTitle('column', { index: index + 1, text: trackText(track), empty: emptyOn(colSizes, index) }, t)}
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
