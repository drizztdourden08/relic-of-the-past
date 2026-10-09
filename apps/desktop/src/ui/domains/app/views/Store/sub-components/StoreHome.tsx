/* @layer renderer-components @kind component */
import { Button, Flex, Spinner, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { HookshopHighlight } from '@rotp/design/packs';
import type { StoreHomeProps } from '../Store.type';
import { HIGHLIGHT_PIXEL } from '../Store.constants';
import { updatesLine } from '../behavior/updates-line';
import { StoreGrid } from './StoreGrid';

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
