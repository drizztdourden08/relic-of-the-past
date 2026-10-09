/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import type { OverlayGridLinesProps } from './ContainerOverlay.type';

const OverlayGridLines = (props: OverlayGridLinesProps) => {
  const { lattice, color } = props;
  const { xs, ys, x0, y0, w, h } = lattice;
  return (
    <>
      {xs.map((x, i) => (
        <Box key={`x${i}`} className="hud-overlay__line hud-overlay__line--v" style={{ left: x, top: y0, height: h, background: color }} />
      ))}
      {ys.map((y, i) => (
        <Box key={`y${i}`} className="hud-overlay__line hud-overlay__line--h" style={{ top: y, left: x0, width: w, background: color }} />
      ))}
    </>
  );
};

export { OverlayGridLines };
