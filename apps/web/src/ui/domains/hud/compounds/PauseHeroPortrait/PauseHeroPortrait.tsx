/* @layer renderer-hud @kind component */
/**
 * PauseHeroPortrait shows the player character as the game would draw them,
 * wearing what the save holds and doing whatever the idler says.
 *
 * It is the same composer the sprite studio previews with, given the palette
 * the core would be holding: change the armour tier on the gear screen and the
 * portrait repaints on the next render, because the palette is a prop and the
 * view recomputes it from live equipment. That immediacy is the point of
 * putting a portrait in the menu at all. A tier change you can see is worth
 * more than a tier number you have to read.
 *
 * It draws ONE pose and holds NO clock. Which pose, which way round and which
 * frame all arrive as props, because the thing choosing them is a pure
 * sequencer in the shared layer and the thing ticking it is the view. That
 * split is what lets the sequence table be exercised without a canvas.
 *
 * The pose atlas reserves a canvas big enough for every pose, so the box is
 * wider and taller than the standing frame; the padding is transparent, and
 * `POSE_ORIGIN` says where inside it the character's own origin (the pixel the
 * engine positions them by) actually sits, which is what lets a caller line
 * the canvas up with a world position instead of with its own corner.
 */
import { poseCanvasSize } from '@shared/game/data/native-tables/player-pose-atlas';
import { PoseCanvas } from '@domains/packs/character/compounds/PoseCanvas';
import { HudBox } from '../../primitives/HudBox';
import './PauseHeroPortrait.css';
import type { PauseHeroPortraitProps } from './PauseHeroPortrait.type';

const { width: POSE_W, height: POSE_H, originX, originY } = poseCanvasSize();

/** Where the character's own origin sits inside the reserved canvas. */
const POSE_ORIGIN = { x: originX, y: originY } as const;

const PauseHeroPortrait = (props: PauseHeroPortraitProps) => {
  const { sheet, row, state, facing, frame, zoom = 1, scale } = props;

  const drawScale = zoom * scale;
  const box = { width: POSE_W * drawScale, height: POSE_H * drawScale };

  // No sheet yet (assets still loading, or a ROM with nothing compiled) reserves
  // the space instead of collapsing it, so the screen never reflows underneath.
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

export { PauseHeroPortrait, POSE_H, POSE_ORIGIN, POSE_W };
