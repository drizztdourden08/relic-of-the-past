/* @layer website-site @kind component */
import type { FlexProps } from './Flex.type';
import './Flex.css';

const Flex = (props: FlexProps) => {
  const { direction = 'row', gap, align, justify, wrap, as: Tag = 'div', className, children, ...rest } = props;

  return (
    <Tag
      className={className ? `ds-flex ${className}` : 'ds-flex'}
      data-dir={direction}
      data-gap={gap}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap ? '' : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export { Flex };
