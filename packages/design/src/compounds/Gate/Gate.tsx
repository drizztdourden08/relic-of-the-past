/* @layer site-kit @kind component */
import { BRAND_FAMILY, BrandMark, PixelWordmark } from '@drizztdourden08/tessera/brand';
import { Card, Center, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { ToastStack } from '@drizztdourden08/tessera/composites';
import { AppLink } from '../AppLink/AppLink';
import { useSiteDefinition } from '../../site/site-context';
import type { GateProps } from './Gate.type';
import './Gate.css';

const Gate = (props: GateProps) => {
  const { title, lead, art, children, footnote } = props;
  const { name, brand } = useSiteDefinition();
  return (
    <Center as="main" className="gate">
      <Stack gap="xl" align="center" className="gate__column">
        <AppLink to="/" aria-label={brand.homeLabel} variant="subtle" tone="neutral" className="gate__brand">
          <Stack gap="sm" align="center">
            <BrandMark app="rotp" size="xl" ground="dark" />
            <PixelWordmark text={brand.wordmark} colors={BRAND_FAMILY.rotp.wordmark.colors} size="md" />
          </Stack>
        </AppLink>
        {art}
        <Card title={title ?? name} className="gate__card">
          <Stack gap="md" align="stretch">
            {lead && <Text as="p" tone="muted" className="gate__lead">{lead}</Text>}
            {children}
            {footnote && <Text as="p" variant="caption" className="gate__foot">{footnote}</Text>}
          </Stack>
        </Card>
      </Stack>
      <ToastStack position="bottom-left" />
    </Center>
  );
};

export { Gate };
export type { GateProps } from './Gate.type';
