/* @layer renderer-hud @kind component */
/**
 * PauseHeroLayer draws the character where the character actually is.
 *
 * The portrait used to be centred in a reserved column, which made it a
 * PICTURE of the player standing somewhere else. Here it is placed at the live
 * player's own screen position, so the menu reads as having come down over a
 * world the character is still standing in. That position is a fact read from
 * the core (`useHeroAnchor`), never a constant: the camera keeps them near the
 * middle, which is why it looks like a layout choice, but it is not one and
 * moves with them.
 *
 * The game's own sprite is suppressed underneath for exactly as long as this
 * layer is up (`HostMenu_HidePlayerOam`, host_menu.c), so the two are never on
 * screen together. It is drawn at native size for the same reason: at any
 * other zoom it would stop registering with the world it claims to stand in.
 *
 * This is a sub-component instead of three more lines in the view because it
 * re-renders about fifteen times a second and the view does not. Keeping the
 * clock down here means the item grid, the cluster and the legend are not
 * rebuilt on every pose change.
 *
 * The outer box is mounted whether the menu is open or not, and is the half
 * that cancels the menu's slide (see `counterTransform`). It has to exist
 * BEFORE the slide starts for the browser to have anything to transition from.
 * A box mounted on the same frame the slide begins would appear at its
 * end state and the cancellation would be a frame late.
 */
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
