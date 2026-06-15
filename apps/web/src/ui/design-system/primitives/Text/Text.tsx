/* @layer renderer-components @kind component */
import './Text.css';
import type { TextProps } from './Text.type';

/** Typographic text element — the design-system's span/p/h* replacement. */
const Text = (props: TextProps) => {
  const { as: Tag = 'span', variant, className = '', children, ...rest } = props;
  return (
    <Tag className={`text${variant ? ` text--${variant}` : ''}${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </Tag>
  );
};

export { Text };
