/* @layer renderer-hud @kind component */
import type { HudImageProps } from './HudImage.type';
import './HudImage.css';

const HudImage = (props: HudImageProps) => {
  const { pixelated = false, block = false, atOrigin = false, className, ...rest } = props;
  const classes = [
    className,
    pixelated && 'hud-image--pixelated',
    block && 'hud-image--block',
    atOrigin && 'hud-image--at-origin',
  ].filter(Boolean).join(' ');

  return <img draggable={false} className={classes || undefined} {...rest} />;
};

export { HudImage };
