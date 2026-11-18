/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Spinner, Stack, Text } from '@drizztdourden08/tessera/primitives';
import type { StoreHomeProps } from '../Store.type';
import { StoreGrid } from './StoreGrid';
import { StoreHomeWelcome } from './StoreHomeWelcome';

const StoreHome = (props: StoreHomeProps) => {
  const t = useT();
  const { name, home, loading, error, updateCount, statusFor, onSelect, onShowUpdates } = props;

  return (
    <Stack gap="lg" className="store-page">
      <StoreHomeWelcome name={name} welcome={home?.welcome} updateCount={updateCount} onShowUpdates={onShowUpdates} />
      {error && <Text as="p" className="store__error">{error}</Text>}
      {loading && !home && <Spinner size="sm" />}
      {home && home.featured.length > 0 && (
        <Stack gap="sm">
          <Text as="h3" className="store__heading">{t('views-store:home.featured')}</Text>
          <StoreGrid items={home.featured} statusFor={statusFor} selectedId={null} onSelect={onSelect} />
        </Stack>
      )}
      {home && home.popular.length > 0 && (
        <Stack gap="sm">
          <Text as="h3" className="store__heading">{t('views-store:home.popular')}</Text>
          <StoreGrid items={home.popular} statusFor={statusFor} selectedId={null} onSelect={onSelect} />
        </Stack>
      )}
    </Stack>
  );
};

export { StoreHome };
