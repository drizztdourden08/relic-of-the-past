/* @layer website-site @kind component */
import { Span } from '../Text';
import type { TagProps } from './Tag.type';
import './Tag.css';

const Tag = ({ variant = 'normal', color = 'neutral', className, children, ...rest }: TagProps) => (
  <span className={`ds-tag ds-tag--${variant} ds-tag--${color}${className ? ` ${className}` : ''}`} {...rest}>
    <Span className="ds-tag__text">{children}</Span>
  </span>
);

export { Tag };
