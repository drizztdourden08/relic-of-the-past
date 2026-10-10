/* @layer store-site @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import uploadIcon from '@iconify-icons/lucide/upload';
import { Text } from '@drizztdourden08/tessera/primitives';
import { SettingsPage } from '@drizztdourden08/tessera/composites';
import { useStoreData } from '../../data/store-data-context';
import { PAGE_TITLES } from './Publish.constants';
import type { PublishProps } from './Publish.type';
import { PublishForm } from './sub-components/PublishForm';
import './Publish.css';

const Publish = (props: PublishProps) => {
  const { mode, itemId } = props;
  const { publications } = useStoreData();
  const item = itemId ? publications.items.find((entry) => entry.id === itemId) ?? null : null;
  const waiting = mode !== 'new' && !item;

  return (
    <SettingsPage icon={<IconifyIcon icon={uploadIcon} />} title={PAGE_TITLES[mode](item?.name ?? '')}>
      {waiting
        ? <Text as="p" variant="caption" role="status">{publications.loading ? 'Loading your publications...' : 'This is not one of your items.'}</Text>
        : <PublishForm key={item?.id ?? 'new'} mode={mode} item={item} />}
    </SettingsPage>
  );
};

export { Publish };
export type { PublishProps } from './Publish.type';
