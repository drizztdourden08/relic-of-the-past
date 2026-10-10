/* @layer store-site @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import userIcon from '@iconify-icons/lucide/user';
import { Stack, Text } from '@drizztdourden08/tessera/primitives';
import { SettingsPage } from '@drizztdourden08/tessera/composites';
import { ItemGrid } from '../../components/ItemGrid/ItemGrid';
import { itemPath } from '../../catalog/item-paths';
import { useAuthor } from './behavior/useAuthor';
import { totalsLine } from './behavior/totals-line';
import type { AuthorProps } from './Author.type';
import './Author.css';

const Author = (props: AuthorProps) => {
  const { userId } = props;
  const { data, error } = useAuthor(userId);
  return (
    <SettingsPage icon={<IconifyIcon icon={userIcon} />} title={data?.author.displayName ?? 'Author'} scroll={false}>
      <Stack gap="md" align="stretch" className="author">
        {!data && <Text as="p" variant="caption" role={error ? 'alert' : 'status'}>{error ?? 'Loading...'}</Text>}
        {data && (
          <>
            <Text as="p" variant="caption" className="author__totals">{totalsLine(data)}</Text>
            <ItemGrid items={data.items} itemPath={itemPath} emptyMessage="Nothing published yet." />
          </>
        )}
      </Stack>
    </SettingsPage>
  );
};

export { Author };
export type { AuthorProps } from './Author.type';
