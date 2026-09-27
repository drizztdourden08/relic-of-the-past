/* @layer store-site @kind component */
/**
 * The featured row, first to last: one row per item with up, down and remove, then a picker
 * over the catalogue to add one more, and Save. The first one shows first on the home page.
 */
import { useMemo, useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import upIcon from '@iconify-icons/lucide/arrow-up';
import downIcon from '@iconify-icons/lucide/arrow-down';
import removeIcon from '@iconify-icons/lucide/x';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { IconButton } from '@ds/primitives/IconButton';
import { Select } from '@ds/primitives/Select';
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
  const [adding, setAdding] = useState('');
  const byId = useMemo(() => new Map(catalog.map((item) => [item.id, item])), [catalog]);
  const options = useMemo(
    () => catalog.filter((item) => !featured?.includes(item.id)).map((item) => ({ value: item.id, label: item.name, description: item.author.displayName })),
    [catalog, featured],
  );

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
      {featured.length === 0 && <Text as="p" variant="caption">Nothing is featured. The home page skips the featured row.</Text>}
      {featured.map((id, index) => {
        const item = byId.get(id);
        const value = item ? <Flex gap="sm" align="center">{item.name} <KindChip kind={item.kind} /></Flex> : `${id} (no longer listed)`;
        return <Row key={id} label={String(index + 1)} value={value} action={controls(id, index)} />;
      })}
      <Flex gap="sm" align="center" wrap>
        <Select value={adding} onChange={setAdding} options={options} placeholder="Pick an item to feature" searchable size="sm" />
        <Button variant="secondary" size="sm" disabled={!adding} onClick={() => { settings.add(adding); setAdding(''); }}>Add</Button>
        <Button variant="primary" size="sm" disabled={busy} onClick={() => void settings.saveFeatured()}>Save the featured row</Button>
      </Flex>
    </Stack>
  );
};

export { FeaturedOrder };
export type { FeaturedOrderProps };
