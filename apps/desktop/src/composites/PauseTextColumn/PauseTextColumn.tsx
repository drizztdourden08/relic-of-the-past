/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { PauseText } from '../PauseText';
import type { PauseTextColumnProps } from './PauseTextColumn.type';

const PauseTextColumn = (props: PauseTextColumnProps) => {
  const { lines, left, top, width, height, scale, size, dim, spritesBase } = props;

  return (
    <HudBox style={{
      position: 'absolute',
      left: left * scale,
      top: top * scale,
      width: width * scale,
      height: height === undefined ? undefined : height * scale,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {lines.map((line, index) => (
        <PauseText key={index} text={line} scale={scale} size={size} dim={dim} spritesBase={spritesBase} />
      ))}
    </HudBox>
  );
};

export { PauseTextColumn };
