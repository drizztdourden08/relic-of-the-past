/* @layer website-site @kind component */
import { Box } from '../../../../design';
import { ShotImage } from '../../../ShotImage';
import { extentOf } from './behavior/extent-of';
import { frameStyleOf } from './behavior/frame-style-of';
import type { RatiosStageProps } from './RatiosStage.type';
import './RatiosStage.css';

const RatiosStage = ({ frames, active }: RatiosStageProps) => {
  const extent = extentOf(frames.map((frame) => frame.shot));

  return (
    <Box className="ratios-visual" data-picked={active === null ? undefined : ''}>
      <Box className="ratios-visual__stage" style={{ aspectRatio: `${extent.width} / ${extent.height}` }}>
        {frames.map((frame, index) => (
          <Box
            key={frame.label}
            className={index === active ? 'ratios-visual__frame ratios-visual__frame--lit' : 'ratios-visual__frame'}
            style={frameStyleOf(frame.shot, extent)}
          >
            <ShotImage shot={frame.shot} className="ratios-visual__shot" />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { RatiosStage };
