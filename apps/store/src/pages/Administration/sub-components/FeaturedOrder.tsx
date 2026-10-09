/* @layer store-site @kind component */
import { useMemo } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import upIcon from '@iconify-icons/lucide/arrow-up';
import downIcon from '@iconify-icons/lucide/arrow-down';
import removeIcon from '@iconify-icons/lucide/x';
import { Button, Flex, IconButton, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { ListItemList, ListItemRow } from '@drizztdourden08/tessera/composites';
import { KindChip } from '../../../components/KindChip/KindChip';
import type { FeaturedOrderProps } from './FeaturedOrder.type';

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
      {featured.length > 0 && (
        <ListItemList label="Featured order">
          {featured.map((id, index) => {
            const item = byId.get(id);
            const value = item ? <Flex gap="sm" align="center">{item.name} <KindChip kind={item.kind} /></Flex> : `${id} (no longer listed)`;
            return <ListItemRow key={id} name={String(index + 1)} columns={[{ primary: value }]} action={controls(id, index)} actionVisibility="always" />;
          })}
        </ListItemList>
      )}
      {featured.length > 0 && (
        <Flex gap="sm" align="center" wrap>
          <Button variant="primary" size="sm" loading={busy} onClick={() => void settings.saveFeatured()}>Save the order</Button>
        </Flex>
      )}
    </Stack>
  );
};

export { FeaturedOrder };
