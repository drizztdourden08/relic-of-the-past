/* @layer website-site @kind component */
import type { TitleProps } from './Title.type';
import './Title.css';

const Title = ({ level = 1, tone, className, ...rest }: TitleProps) => {
  const Tag = `h${level}` as const;
  const toned = tone ? ` ds-text--toned ds-tone--${tone}` : '';

  return <Tag className={`ds-title ds-title--${level}${toned}${className ? ` ${className}` : ''}`} {...rest} />;
};

export { Title };
