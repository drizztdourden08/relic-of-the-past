/* @layer renderer-components @kind component */
/**
 * Home: the welcome with the Hookshop highlight, a line when installed packs have updates,
 * then the featured row and the popular shelf. Everything else a player reads about an item
 * is on the site.
 */
import { Button, Flex, Spinner, Stack, Text } from '@ds/primitives';
import type { HomeResponse } from '@shared/store/api-types';
import type { ItemCardView } from '@shared/store/home-types';
import { HookshopHighlight } from '../../../compounds/HookshopHighlight';
import type { StoreItemStatus } from '../../../compounds/StoreItemCard';
import { StoreGrid } from './StoreGrid';

interface StoreHomeProps {
  name: string;
  home: HomeResponse | null;
  loading: boolean;
  error: string | null;
  updateCount: number;
  statusFor: (item: ItemCardView) => StoreItemStatus;
  onSelect: (itemId: string) => void;
  onShowUpdates: () => void;
}

/** Size of one mascot pixel beside the welcome. */
const HIGHLIGHT_PIXEL = 3;

const updatesLine = (count: number): string =>
  count === 1 ? '1 update for a pack you installed' : `${count} updates for packs you installed`;

const StoreHome = (props: StoreHomeProps) => {
  const { name, home, loading, error, updateCount, statusFor, onSelect, onShowUpdates } = props;

  return (
    <Stack gap="lg" className="store-page">
      <Flex align="center" gap="lg" className="store-home__welcome">
        <HookshopHighlight pixelSize={HIGHLIGHT_PIXEL} className="store-home__highlight" />
        <Stack gap="sm">
          <Text as="h2" className="store__title">Welcome back, {name}</Text>
          {home?.welcome && <Text as="p" className="store__lead">{home.welcome}</Text>}
          {updateCount > 0 && (
            <Flex>
              <Button variant="secondary" size="sm" onClick={onShowUpdates}>{updatesLine(updateCount)}</Button>
            </Flex>
          )}
        </Stack>
      </Flex>
      {error && <Text as="p" className="store__error">{error}</Text>}
      {loading && !home && <Spinner size="sm" />}
      {home && home.featured.length > 0 && (
        <Stack gap="sm">
          <Text as="h3" className="store__heading">Featured</Text>
          <StoreGrid items={home.featured} statusFor={statusFor} selectedId={null} onSelect={onSelect} />
        </Stack>
      )}
      {home && home.popular.length > 0 && (
        <Stack gap="sm">
          <Flex align="baseline" gap="sm">
            <Text as="h3" className="store__heading">Popular this month</Text>
            <Text as="span" className="store__hint">by installs in the last 30 days</Text>
          </Flex>
          <StoreGrid items={home.popular} statusFor={statusFor} selectedId={null} onSelect={onSelect} />
        </Stack>
      )}
    </Stack>
  );
};

export { StoreHome };
