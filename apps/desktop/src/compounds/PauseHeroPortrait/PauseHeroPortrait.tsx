/* @layer renderer-hud @kind component */
import { PoseCanvas } from '@rotp/design/packs';
import { HudBox } from '../../primitives/HudBox';
import './PauseHeroPortrait.css';
import { POSE_H, POSE_W } from './PauseHeroPortrait.constants';
import type { PauseHeroPortraitProps } from './PauseHeroPortrait.type';

const PauseHeroPortrait = (props: PauseHeroPortraitProps) => {
  const { sheet, row, state, facing, frame, zoom = 1, scale } = props;

  const drawScale = zoom * scale;
  const box = { width: POSE_W * drawScale, height: POSE_H * drawScale };

  if (!sheet || !row || !state) return <HudBox style={box} />;

  return (
    <HudBox style={box}>
      <PoseCanvas
        sheet={sheet}
        row={row}
        state={state}
        facing={facing}
        tick={frame}
        scale={drawScale}
        className="pause-hero__canvas"
      />
    </HudBox>
  );
};

export { PauseHeroPortrait };
