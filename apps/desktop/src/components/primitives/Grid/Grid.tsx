/* @layer renderer-components @kind component */
import './Grid.css';
import type { CSSProperties } from 'react';
import type { GridProps } from './types';

const Grid = (props: GridProps) => {
  const { columns, minColWidth, gap, className = '', style, children, ...rest } = props;
  // Column template is a dynamic/computed value → legitimately inline.
  const templateStyle: CSSProperties | undefined = minColWidth
    ? { gridTemplateColumns: `repeat(auto-fill, minmax(${minColWidth}px, 1fr))` }
    : columns
      ? { gridTemplateColumns: `repeat(${columns}, 1fr)` }
      : undefined;
  return (
    <div
      className={`grid${className ? ` ${className}` : ''}`}
      data-gap={gap}
      style={templateStyle ? { ...templateStyle, ...style } : style}
      {...rest}
    >
      {children}
    </div>
  );
};

export { Grid };
