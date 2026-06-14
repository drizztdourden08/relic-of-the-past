/* @layer renderer-components @kind component */
import './Thumbnail.css';
import type { ThumbnailProps } from './Thumbnail.type';

/** Fixed-frame image with a graceful empty placeholder. Size via className. */
const Thumbnail = (props: ThumbnailProps) => {
  const { src, alt = '', placeholder, className = '', ...rest } = props;

  return (
    <div className={`thumbnail${className ? ` ${className}` : ''}`} {...rest}>
      {src ? (
        <img src={src} alt={alt} className="thumbnail__img" />
      ) : (
        <div className="thumbnail__empty">{placeholder}</div>
      )}
    </div>
  );
};

export { Thumbnail };
