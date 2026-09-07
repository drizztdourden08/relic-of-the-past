/* @layer renderer-components @kind component */
import type { VideoProps } from './Video.type';

/** Plain `<video>` replacement. The raw element lives here, in the primitive. */
const Video = (props: VideoProps) => <video {...props} />;

export { Video };
