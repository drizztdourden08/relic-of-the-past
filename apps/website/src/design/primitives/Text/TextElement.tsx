/* @layer website-site @kind component */
import type { TextElementProps } from './Text.type';
import './TextElement.css';

const TextElement = ({ as: Tag, tone, className, ...rest }: TextElementProps) => {
  const own = typeof Tag === 'string' ? `ds-text ds-text--${Tag}` : 'ds-text';
  const toned = tone ? ` ds-text--toned ds-tone--${tone}` : '';

  return <Tag className={`${own}${toned}${className ? ` ${className}` : ''}`} {...rest} />;
};

export { TextElement };
