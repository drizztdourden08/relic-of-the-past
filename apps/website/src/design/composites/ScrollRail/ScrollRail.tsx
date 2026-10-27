/* @layer website-site @kind component */
import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { Box } from '../../primitives/Box';
import { Pressable } from '../../primitives/Pressable';
import { useRailGeometry } from './behavior/useRailGeometry';
import { useRailProgress } from './behavior/useRailProgress';
import { useThumbDrag } from './behavior/useThumbDrag';
import type { ScrollRailProps } from './ScrollRail.type';
import './ScrollRail.css';

const ScrollRail = (props: ScrollRailProps) => {
  const { marks, rangeId, activeId, onSelect, ariaLabel, thumbLabel, end, className } = props;
  const geometry = useRailGeometry(marks, rangeId);
  const railRef = useRailProgress(geometry);
  const trackRef = useRef<HTMLElement | null>(null);
  const drag = useThumbDrag(geometry, trackRef);

  return (
    <Box as="nav" ref={railRef} aria-label={ariaLabel} className={className ? `ds-rail ${className}` : 'ds-rail'} data-idle={activeId === null || undefined}>
      <Box ref={trackRef} className="ds-rail__track">
        <Box className="ds-rail__line" aria-hidden="true" />
        <Pressable className="ds-rail__thumb" aria-label={thumbLabel} {...drag} />
      </Box>
      <Box as="ol" className="ds-rail__marks">
        {marks.map((mark, index) => (
          <Box as="li" key={mark.id} className="ds-rail__mark" style={{ '--mark': geometry.fractions[index] ?? 0 } as CSSProperties}>
            <Pressable
              className="ds-rail__numeral"
              aria-label={mark.name}
              aria-current={mark.id === activeId ? 'location' : undefined}
              onClick={() => onSelect(mark.id)}
            >
              {mark.label}
            </Pressable>
          </Box>
        ))}
      </Box>
      {end ? (
        <Pressable className="ds-rail__end" aria-label={end.name} onClick={end.onSelect}>
          {end.icon}
        </Pressable>
      ) : null}
    </Box>
  );
};

export { ScrollRail };
