/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Box, Image, Text } from '@drizztdourden08/tessera/primitives';
import { modeBadgeSrc } from './behavior/mode-badge-src';
import { MODE_BADGE_MESSAGES, MODE_BADGE_MONOGRAMS } from './ModeBadge.constants';
import type { ModeBadgeProps } from './ModeBadge.type';
import './ModeBadge.css';

const ModeBadge = (props: ModeBadgeProps) => {
  const { mode, className = '' } = props;
  const text = useText();
  const t = useT();
  const label = t('compounds:mode-badge.aria', { mode: text(MODE_BADGE_MESSAGES[mode]) });
  const src = modeBadgeSrc(mode);

  return (
    <Box
      as="span"
      className={`mode-badge mode-badge--${mode}${className ? ` ${className}` : ''}`}
      role="img"
      aria-label={label}
      title={label}
    >
      {src
        ? <Image className="mode-badge__img" src={src} alt="" />
        : <Text as="span" className="mode-badge__monogram" aria-hidden="true">{MODE_BADGE_MONOGRAMS[mode]}</Text>}
    </Box>
  );
};

export { ModeBadge };

