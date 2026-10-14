/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import { PAUSE_FOCUS_COLOR, PauseText } from '../../../composites/PauseText';
import { ACTIONS, ACTIONS_Y, ACTION_GLYPH, ACTION_PAD, ACTION_PITCH, ACTION_X } from '../PauseStatusScreen.constants';
import type { StatusActionsProps } from '../PauseStatusScreen.type';

const StatusActions = ({ cursor, scale, spritesBase, onFocusAction, onConfirm }: StatusActionsProps) => {
  const px = (n: number): number => n * scale;

  return (
    <>
      {ACTIONS.map((action, index) => (
        <HudBox
          key={action.id}
          onClick={() => { onFocusAction(index); onConfirm(); }}
          style={{
            position: 'absolute',
            left: px(ACTION_X + index * ACTION_PITCH),
            top: px(ACTIONS_Y),
            padding: px(ACTION_PAD),
            cursor: 'pointer',
            outline: index === cursor ? `${px(1)}px solid ${PAUSE_FOCUS_COLOR}` : undefined,
          }}
        >
          <PauseText
            text={action.label}
            scale={scale}
            size={ACTION_GLYPH}
            dim={index !== cursor}
            spritesBase={spritesBase}
          />
        </HudBox>
      ))}
    </>
  );
};

export { StatusActions };
