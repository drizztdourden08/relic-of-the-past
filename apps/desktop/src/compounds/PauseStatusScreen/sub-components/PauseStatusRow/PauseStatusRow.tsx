/* @layer renderer-hud @kind component */
import { HudBox } from '../../../../primitives/HudBox';
import { PauseText } from '../../../../composites/PauseText';
import { LABEL_GLYPH, VALUE_X } from '../../PauseStatusScreen.constants';
import type { PauseStatusRowProps } from './PauseStatusRow.type';

const PauseStatusRow = (props: PauseStatusRowProps) => {
  const { label, top, valueTop = 0, scale, spritesBase, children } = props;

  const px = (n: number): number => n * scale;

  return (
    <>
      <HudBox style={{ position: 'absolute', left: 0, top: px(top) }}>
        <PauseText text={label} scale={scale} size={LABEL_GLYPH} spritesBase={spritesBase} />
      </HudBox>
      <HudBox style={{
        position: 'absolute',
        left: px(VALUE_X),
        top: px(top + valueTop),
        display: 'flex',
        alignItems: 'center',
      }}>
        {children}
      </HudBox>
    </>
  );
};

export { PauseStatusRow };
