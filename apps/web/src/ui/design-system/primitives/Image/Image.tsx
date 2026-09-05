/* @layer renderer-components @kind component */
import type { ImageProps } from './Image.type';

/** Plain `<img>` replacement. The raw element lives here, in the primitive. */
const Image = (props: ImageProps) => {
  const { alt = '', ...rest } = props;
  return <img alt={alt} {...rest} />;
};

export { Image };
