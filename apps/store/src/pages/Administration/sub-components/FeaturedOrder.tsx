/* @layer store-site @kind component */
/**
 * The featured row, first to last: one row per item with up, down and remove, and Save. The
 * first one shows first on the home page. Items join the row from their own page (Feature).
 */
import { useMemo } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import upIcon from '@iconify-icons/lucide/arrow-up';
import downIcon from '@iconify-icons/lucide/arrow-down';
import removeIcon from '@iconify-icons/lucide/x';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { IconButton } from '@ds/primitives/IconButton';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import type { ItemCardView } from '@shared/store/home-types';
import { Row } from '@site-kit/components/Row/Row';
import { KindChip } from '../../../components/KindChip/KindChip';
import type { HomeSettingsState } from '../behavior/useHomeSettings';

type FeaturedOrderProps = {
  settings: HomeSettingsState;
  catalog: readonly ItemCardView[];
};

const FeaturedOrder = (props: FeaturedOrderProps) => {
  const { settings, catalog } = props;
  const { featured, busy } = settings;
  const byId = useMemo(() => new Map(catalog.map((item) => [item.id, item])), [catalog]);

  if (!featured) return <Text as="p" variant="caption">Loading the featured row...</Text>;

  const controls = (id: string, index: number) => (
    <Flex gap="xs">
      <IconButton variant="ghost" size="sm" label="Move up" disabled={index === 0} onClick={() => settings.move(id, -1)}><IconifyIcon icon={upIcon} /></IconButton>
      <IconButton variant="ghost" size="sm" label="Move down" disabled={index === featured.length - 1} onClick={() => settings.move(id, 1)}><IconifyIcon icon={downIcon} /></IconButton>
      <IconButton variant="ghost" size="sm" label="Remove" onClick={() => settings.remove(id)}><IconifyIcon icon={removeIcon} /></IconButton>
    </Flex>
  );

  return (
    <Stack gap="sm" align="stretch">
      <Text as="p" variant="caption">To feature an item, open its page and press Feature.</Text>
      {featured.length === 0 && <Text as="p" variant="caption">Nothing is featured. The home page skips the featured row.</Text>}
      {featured.map((id, index) => {
        const item = byId.get(id);
        const value = item ? <Flex gap="sm" align="center">{item.name} <KindChip kind={item.kind} /></Flex> : `${id} (no longer listed)`;
        return <Row key={id} label={String(index + 1)} value={value} action={controls(id, index)} />;
      })}
      {featured.length > 0 && (
        <Flex gap="sm" align="center" wrap>
          <Button variant="primary" size="sm" busy={busy} onClick={() => void settings.saveFeatured()}>Save the order</Button>
        </Flex>
      )}
    </Stack>
  );
};

export { FeaturedOrder };
export type { FeaturedOrderProps };
