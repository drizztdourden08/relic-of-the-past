/* @layer renderer-components @kind component */
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import { BANNER_ACTION, BANNER_TEXT } from './controls.constants';
import type { SchemeBannerProps } from './controls.type';
import './SchemeBanner.css';

const SchemeBanner = ({ onOpenHudStyle }: SchemeBannerProps) => (
  <Box className="scheme-banner">
    <Text variant="caption" className="scheme-banner__text">{BANNER_TEXT}</Text>
    <Button variant="tertiary" size="sm" onClick={onOpenHudStyle}>{BANNER_ACTION}</Button>
  </Box>
);

export { SchemeBanner };
