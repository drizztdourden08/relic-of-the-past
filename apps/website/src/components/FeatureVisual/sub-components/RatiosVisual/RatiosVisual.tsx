/* @layer website-site @kind component */
import { Box, Pressable } from '../../../../design';
import { ShotImage } from '../../../ShotImage';
import { useReducedMotion } from '../../behavior/useReducedMotion';
import { ShotFrame } from '../ShotFrame';
import { extentOf } from './behavior/extent-of';
import { frameStyleOf } from './behavior/frame-style-of';
import { useRatioLoop } from './behavior/useRatioLoop';
import type { VisualProps } from '../../FeatureVisual.type';
import './RatiosVisual.css';

const RatiosVisual = ({ visual, caption }: VisualProps<'ratios'>) => {
  const { frames } = visual;
  const { active, select } = useRatioLoop(frames.length, useReducedMotion());
  const extent = extentOf(frames.map((frame) => frame.shot));

  return (
    <ShotFrame caption={caption} framed={false}>
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
        <Box className="ratios-visual__labels" role="group" aria-label="Aspect ratios">
          {frames.map((frame, index) => (
            <Pressable
              key={frame.label}
              className="ratios-visual__label"
              aria-pressed={index === active}
              onClick={() => select(index)}
            >
              {frame.label}
            </Pressable>
          ))}
        </Box>
      </Box>
    </ShotFrame>
  );
};

export { RatiosVisual };
