/* @layer website-site @kind component */
import { Box, Pressable } from '../../../../design';
import { useReducedMotion } from '../../behavior/useReducedMotion';
import { Expandable } from '../Expandable';
import { extentOf, RatiosStage } from '../RatiosStage';
import { ShotFrame } from '../ShotFrame';
import { useRatioLoop } from './behavior/useRatioLoop';
import type { VisualProps } from '../../FeatureVisual.type';
import './RatiosVisual.css';

const RatiosVisual = ({ visual, caption }: VisualProps<'ratios'>) => {
  const { frames } = visual;
  const { active, select } = useRatioLoop(frames.length, useReducedMotion());
  const extent = extentOf(frames.map((frame) => frame.shot));

  return (
    <ShotFrame caption={caption} framed={false}>
      <Expandable aspect={extent.width / extent.height} label={caption} expanded={<RatiosStage frames={frames} active={active} />}>
        <RatiosStage frames={frames} active={active} />
      </Expandable>
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
    </ShotFrame>
  );
};

export { RatiosVisual };
