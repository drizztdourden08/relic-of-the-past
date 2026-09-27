/* @layer store-site @kind component */
/**
 * Publish: a new item, the next version of one, or an edit to its listing. A version or an
 * edit is for one of the player's own items, found in their publications; the form waits
 * for that list. Uploads in flight show in the side column.
 */
import uploadIcon from '@iconify-icons/lucide/upload';
import { Text } from '@ds/primitives/Text';
import { useStoreData } from '../../data/store-data-context';
import { TitledPage } from '../../layout/TitledPage/TitledPage';
import { UploadsColumn } from '../../upload/UploadsColumn';
import { PAGE_TITLES } from './Publish.constants';
import type { PublishMode } from './Publish.constants';
import { PublishForm } from './sub-components/PublishForm';
import './Publish.css';

type PublishProps = {
  mode: PublishMode;
  /** The item a version or an edit is for. */
  itemId?: string;
};

const ASIDE = <UploadsColumn />;

const Publish = (props: PublishProps) => {
  const { mode, itemId } = props;
  const { publications } = useStoreData();
  const item = itemId ? publications.items.find((entry) => entry.id === itemId) ?? null : null;
  const waiting = mode !== 'new' && !item;

  return (
    <TitledPage icon={uploadIcon} title={PAGE_TITLES[mode](item?.name ?? '')} aside={ASIDE}>
      {waiting
        ? <Text as="p" variant="caption" role="status">{publications.loading ? 'Loading your publications...' : 'This is not one of your items.'}</Text>
        : <PublishForm key={item?.id ?? 'new'} mode={mode} item={item} />}
    </TitledPage>
  );
};

export { Publish };
export type { PublishProps };
