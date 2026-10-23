/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Svg, SvgPath } from '@drizztdourden08/tessera/primitives';
import { describePart } from './behavior/describe-part';
import { isActive } from './behavior/is-active';
import { layoutLabels } from './behavior/layout-labels';
import { placeParts } from './behavior/place-parts';
import { OVERLAY_BOX, OVERLAY_VIEW_BOX } from './PadOverlay.constants';
import type { PadOverlayProps } from './PadOverlay.type';
import { OverlayLabel } from './sub-components/OverlayLabel';
import { OverlayPart } from './sub-components/OverlayPart';
import './PadOverlay.css';

const PadOverlay = ({ outline, anchors, slots, state, label }: PadOverlayProps) => {
  const parts = useMemo(() => placeParts(slots, anchors, OVERLAY_BOX), [slots, anchors]);
  const labels = useMemo(() => layoutLabels(parts, OVERLAY_BOX), [parts]);
  const held = labels.filter(({ part }) => isActive(part.slot.kind, state[part.slot.anchor]));

  return (
    <Box as="figure" className="pad-overlay" aria-label={label}>
      <Svg className="pad-overlay__art" viewBox={OVERLAY_VIEW_BOX} aria-hidden="true">
        <SvgPath className="pad-overlay__outline" d={outline} transform={`translate(${OVERLAY_BOX.gutter} ${OVERLAY_BOX.top})`} />
        {labels.map((placed) => {
          const { kind, anchor } = placed.part.slot;
          return (
            <OverlayLabel
              key={anchor}
              placed={placed}
              detail={describePart(kind, state[anchor])}
              active={isActive(kind, state[anchor])}
            />
          );
        })}
        {parts.map((part) => <OverlayPart key={part.slot.anchor} part={part} state={state[part.slot.anchor]} />)}
      </Svg>
      <Box as="ul" className="pad-overlay__held">
        {held.map(({ part }) => <Box as="li" key={part.slot.anchor}>{part.slot.label}</Box>)}
      </Box>
    </Box>
  );
};

export { PadOverlay };
