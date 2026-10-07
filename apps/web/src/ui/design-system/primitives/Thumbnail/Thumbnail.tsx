/* @layer renderer-components @kind component */
import { useState } from 'react';
import './Thumbnail.css';
import type { ThumbnailProps } from './Thumbnail.type';

/**
 * Fixed-frame image with a graceful empty placeholder. Size via className.
 *
 * Falls back to the placeholder on a load error too, not only when `src` is
 * absent. A caller that always supplies a URL (instead of gating it on some
 * bulk "is everything ready" flag) still gets a graceful per-tile miss for
 * whichever ones 404, instead of a broken-image icon. Tracked by comparing
 * against the failing `src` itself, so a later render with a NEW `src` (the
 * same file, freshly extracted) tries again instead of staying stuck.
 */
const Thumbnail = (props: ThumbnailProps) => {
  const { src, alt = '', placeholder, className = '', ...rest } = props;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImg = Boolean(src) && src !== failedSrc;

  return (
    <div className={`thumbnail${className ? ` ${className}` : ''}`} {...rest}>
      {showImg ? (
        <img src={src ?? undefined} alt={alt} className="thumbnail__img" onError={() => setFailedSrc(src ?? null)} />
      ) : (
        <div className="thumbnail__empty">{placeholder}</div>
      )}
    </div>
  );
};

export { Thumbnail };
