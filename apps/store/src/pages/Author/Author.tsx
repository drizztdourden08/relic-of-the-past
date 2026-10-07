/* @layer store-site @kind component */
/**
 * An author's public page: their name, the day they joined, how many items they published,
 * their installs and ratings, then their published items. Nothing waiting or rejected
 * shows here; that lives on their own My publications page.
 */
import userIcon from '@iconify-icons/lucide/user';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import type { AuthorResponse } from '@shared/store/api-types';
import { formatDay } from '@site-kit/lib/format-date';
import { ItemGrid } from '../../components/ItemGrid/ItemGrid';
import { TitledPage } from '../../layout/TitledPage/TitledPage';
import { itemPath } from '../../catalog/item-paths';
import { formatAverage, formatCount, plural } from '../../lib/format-count';
import { useAuthor } from './behavior/useAuthor';
import './Author.css';

type AuthorProps = { userId: string };

const totalsLine = (data: AuthorResponse): string => {
  const { author, items } = data;
  const rating = author.ratingAverage === null
    ? 'no ratings yet'
    : `★ ${formatAverage(author.ratingAverage)} from ${plural(author.ratingCount, 'rating', 'ratings')}`;
  return `joined ${formatDay(author.joinedAt)} · ${formatCount(items.length)} published · ${plural(author.installs, 'install', 'installs')} · ${rating}`;
};

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
export type { AuthorProps };
