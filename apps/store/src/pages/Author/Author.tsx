/* @layer store-site @kind component */
import userIcon from '@iconify-icons/lucide/user';
import { Stack, Text } from '@drizztdourden08/tessera/primitives';
import { ItemGrid } from '../../components/ItemGrid/ItemGrid';
import { TitledPage } from '../../layout/TitledPage/TitledPage';
import { itemPath } from '../../catalog/item-paths';
import { useAuthor } from './behavior/useAuthor';
import { totalsLine } from './behavior/totals-line';
import type { AuthorProps } from './Author.type';
import './Author.css';

const Author = (props: AuthorProps) => {
  const { userId } = props;
  const { data, error } = useAuthor(userId);
  return (
    <TitledPage icon={userIcon} title={data?.author.displayName ?? 'Author'} scroll={false}>
      <Stack gap="md" align="stretch" className="author">
        {!data && <Text as="p" variant="caption" role={error ? 'alert' : 'status'}>{error ?? 'Loading...'}</Text>}
        {data && (
          <>
            <Text as="p" variant="caption" className="author__totals">{totalsLine(data)}</Text>
            <ItemGrid items={data.items} itemPath={itemPath} emptyMessage="Nothing published yet." />
          </>
        )}
      </Stack>
    </TitledPage>
  );
};

export { Author };
export type { AuthorProps } from './Author.type';
