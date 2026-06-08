/* @layer renderer-components @kind component */
import type { IconProps } from './Icon.type';

/** Inline SVG icon — raw <svg>/<path> live here, in the primitive. */
const Icon = (props: IconProps) => {
  const { paths, size = 16, viewBox = '0 0 16 16', ...rest } = props;
  return (
    <svg width={size} height={size} viewBox={viewBox} fill="currentColor" {...rest}>
      {paths.map((d) => <path key={d} d={d} />)}
    </svg>
  );
};

export { Icon };
