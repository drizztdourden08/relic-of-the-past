/* @layer website-site @kind component */
import { ICON_DEFAULT_SIZE, ICON_SHAPES, ICON_STROKE_WIDTH, ICON_VIEW_BOX } from './Icon.constants';
import type { IconProps } from './Icon.type';

const Icon = ({ name, size = ICON_DEFAULT_SIZE, label, className, ...rest }: IconProps) => {
  const shape = ICON_SHAPES[name];

  return (
    <svg
      className={className ? `ds-icon ${className}` : 'ds-icon'}
      width={size}
      height={size}
      viewBox={ICON_VIEW_BOX}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={ICON_STROKE_WIDTH}>
        {shape.paths.map((d) => (
          <path key={d} d={d} />
        ))}
        {shape.circles?.map((circle) => (
          <circle key={`${circle.cx}-${circle.cy}-${circle.r}`} {...circle} />
        ))}
      </g>
    </svg>
  );
};

export { Icon };
