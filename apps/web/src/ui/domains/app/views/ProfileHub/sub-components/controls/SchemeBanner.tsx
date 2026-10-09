/* @layer renderer-components @kind component */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Button } from '../../../../../../design-system/primitives/Button';
import { BANNER_ACTION, BANNER_TEXT } from './controls.constants';
import type { SchemeBannerProps } from './controls.type';
import './SchemeBanner.css';

const SchemeBanner = ({ onOpenHudStyle }: SchemeBannerProps) => (
  <Box className="scheme-banner">
    <Text variant="caption">{BANNER_TEXT}</Text>
    <Button variant="tertiary" size="sm" onClick={onOpenHudStyle}>{BANNER_ACTION}</Button>
  </Box>
);

export { SchemeBanner };
export type { SchemeBannerProps };
