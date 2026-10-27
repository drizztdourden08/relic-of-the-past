/* @layer website-site @kind component */
import { Icon } from '../Icon';
import { EXTERNAL_ICON_SIZE, EXTERNAL_LABEL, EXTERNAL_LINK } from './Link.constants';
import type { LinkProps } from './Link.type';
import './Link.css';

const Link = (props: LinkProps) => {
  const { tone = 'primary', variant = 'inline', external = false, className, children, ...rest } = props;

  return (
    <a
      {...(external ? EXTERNAL_LINK : undefined)}
      {...rest}
      className={className ? `ds-link ${className}` : 'ds-link'}
      data-tone={tone}
      data-variant={variant}
    >
      {children}
      {external && (
        <Icon
          name="external-link"
          size={EXTERNAL_ICON_SIZE}
          className={children ? 'ds-link__external ds-link__external--spaced' : 'ds-link__external'}
          label={EXTERNAL_LABEL}
        />
      )}
    </a>
  );
};

export { Link };
