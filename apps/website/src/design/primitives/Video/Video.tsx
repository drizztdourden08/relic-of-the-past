/* @layer website-site @kind component */
import type { VideoProps } from './Video.type';
import './Video.css';

const Video = ({ looping = false, className, ...rest }: VideoProps) => (
  <video className={className ? `ds-video ${className}` : 'ds-video'} loop={looping} muted playsInline disablePictureInPicture {...rest} />
);

export { Video };
