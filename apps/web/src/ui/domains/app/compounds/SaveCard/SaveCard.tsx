/* @layer renderer-components @kind component */
import { Box } from '../../../../design-system/primitives/Box';
import './SaveCard.css';
import type { SaveCardProps } from './SaveCard.type';

/** Shared save-entry shell: thumbnail + info + actions, in row or feature form. */
const SaveCard = (props: SaveCardProps) => {
  const { variant = 'row', busy = false, thumb, actions, className = '', children, ...rest } = props;

  const cls = [
    'save-card',
    `save-card--${variant}`,
    busy && 'save-card--busy',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Box className={cls} {...rest}>
      {thumb}
      <Box className="save-card__info">{children}</Box>
      {actions && <Box className="save-card__actions">{actions}</Box>}
    </Box>
  );
};

export { SaveCard };
