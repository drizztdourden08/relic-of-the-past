/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { PlacedPart } from '../PlacedPart';
import { layoutMascot } from './behavior/mascot-layout';
import { SOURCES } from './behavior/piece-sources.constants';
import type { MascotProps } from './Mascot.type';

const Mascot = (props: MascotProps) => {
  const { look, podAngles, className } = props;
  const lookX = look?.[0] ?? 0, lookY = look?.[1] ?? 0;
  const podLeft = podAngles?.left ?? 0, podRight = podAngles?.right ?? 0;
  const pieces = useMemo(
    () => layoutMascot([lookX, lookY], { left: podLeft, right: podRight })
      .map((p, i) => ({ key: `${p.piece}-${i}`, src: SOURCES[p.piece], box: p })),
    [lookX, lookY, podLeft, podRight],
  );

  return (
    <Box className={className ? `placed-layer ${className}` : 'placed-layer'} aria-hidden="true">
      {pieces.map(({ key, src, box }) => (
        <PlacedPart key={key} box={box} src={src} />
      ))}
    </Box>
  );
};

export { Mascot };
