/* @layer renderer-hud @kind component */
import { stateFor } from '@shared/game/data/native-tables/player-pose-atlas';
import { HudBox } from '../../../../primitives/HudBox';
import { PauseHeroPortrait, POSE_ORIGIN } from '../../../../compounds/PauseHeroPortrait';
import { useHeroAnchor } from '../../behavior/useHeroAnchor';
import { useHeroIdle } from '../../behavior/useHeroIdle';
import { useHeroWearing } from '../../behavior/useHeroWearing';
import type { PauseHeroLayerProps } from './PauseHeroLayer.type';

const PauseHeroLayer = (props: PauseHeroLayerProps) => {
  const { active, scale, counterTransform, transition } = props;

  const { sheet, row } = useHeroWearing();
  const pose = useHeroIdle(active);
  const anchor = useHeroAnchor(active);

  const state = stateFor(pose.action);
  const px = (n: number): number => n * scale;
  const ready = active && anchor !== null && sheet !== null && row !== null;

  return (
    <HudBox
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        transform: counterTransform,
        transition,
      }}
    >
      {ready && (
        <HudBox
          className="pause-hero"
          style={{
            position: 'absolute',
            left: px(anchor.x + pose.offsetX - POSE_ORIGIN.x),
            top: px(anchor.y + pose.offsetY - POSE_ORIGIN.y),
          }}
        >
          <PauseHeroPortrait
            sheet={sheet}
            row={row}
            state={state}
            facing={pose.facing}
            frame={pose.frame}
            scale={scale}
          />
        </HudBox>
      )}
    </HudBox>
  );
};

export { PauseHeroLayer };
