/* @layer website-site @kind component */
import { frameStyleOf } from './behavior/frame-style-of';
import { useImageStatus } from './behavior/useImageStatus';
import type { ImageProps } from './Image.type';
import './Image.css';

const Image = (props: ImageProps) => {
  const { alt = '', aspectRatio, className, fit = 'cover', pixelated = false, style, onLoad, onError, ...rest } = props;
  const { src, width, height } = rest;
  const { imgRef, status, naturalRatio, ...handlers } = useImageStatus(src ?? '');
  const classes = ['ds-image', `ds-image--${status}`, fit !== 'cover' && `ds-image--fit-${fit}`, pixelated && 'ds-image--pixelated', className];

  return (
    <span className={classes.filter(Boolean).join(' ')} style={frameStyleOf({ aspectRatio, width, height, naturalRatio, style })}>
      {src ? (
        <img
          ref={imgRef}
          className="ds-image__img"
          alt={alt}
          {...rest}
          onLoad={(event) => {
            handlers.onLoad(event);
            onLoad?.(event);
          }}
          onError={(event) => {
            handlers.onError(event);
            onError?.(event);
          }}
        />
      ) : null}
    </span>
  );
};

export { Image };
