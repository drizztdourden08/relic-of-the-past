/* @layer renderer-components @kind component */
import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Box, Svg, SvgPath } from '@drizztdourden08/tessera/primitives';
import { describePart } from './behavior/describe-part';
import { isActive } from './behavior/is-active';
import { useFittedOverlay } from './behavior/useFittedOverlay';
import type { PadOverlayProps } from './PadOverlay.type';
import { OverlayLabel } from './sub-components/OverlayLabel';
import { OverlayPart } from './sub-components/OverlayPart';
import './PadOverlay.css';

const PadOverlay = ({ outline, anchors, slots, state, label, onGrownChange }: PadOverlayProps) => {
  const ref = useRef<HTMLElement>(null);
  const { layout, grownTo } = useFittedOverlay(ref, slots, anchors, outline);
  const held = slots.filter((slot) => isActive(slot.kind, state[slot.anchor]));
  const isGrown = grownTo > 0;
  const grown = isGrown ? ({ '--pad-overlay-grow': `${grownTo}px` } as CSSProperties) : undefined;

  useEffect(() => onGrownChange?.(isGrown), [onGrownChange, isGrown]);

  return (
    <Box as="figure" ref={ref} className="pad-overlay" aria-label={label} style={grown} data-grown={grown ? '' : undefined}>
      {layout && (
        <Svg
          className="pad-overlay__art"
          width={layout.frame.width}
          height={layout.frame.height}
          viewBox={`0 0 ${layout.frame.width} ${layout.frame.height}`}
          aria-hidden="true"
        >
          <SvgPath
            className="pad-overlay__outline"
            d={outline}
            transform={`translate(${layout.frame.origin.x} ${layout.frame.origin.y}) scale(${layout.frame.scale})`}
          />
          {layout.labels.map((placed) => {
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
          {layout.parts.map((part) => <OverlayPart key={part.slot.anchor} part={part} state={state[part.slot.anchor]} />)}
        </Svg>
      )}
      <Box as="ul" className="pad-overlay__held">
        {held.map((slot) => <Box as="li" key={slot.anchor}>{slot.label}</Box>)}
      </Box>
    </Box>
  );
};

export { PadOverlay };
