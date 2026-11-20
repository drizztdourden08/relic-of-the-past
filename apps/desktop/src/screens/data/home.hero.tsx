/* @layer renderer-app @kind component */
import { useMemo } from 'react';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { usePlatform, useT } from '@drizztdourden08/brock-react';
import type { HeroProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { Button, Icon } from '@drizztdourden08/tessera/primitives';
import { DataHome, dataHomeFacts } from '@app/views/DataHome';
import { useStorageSummary } from '@app/views/DataManager/sub-components/data-overview/useStorageSummary';

const meta: ScreenMeta = {
  title: msg('views-mobile-shell:menu.home'),
  icon: 'house',
  keywords: ['data', 'overview', 'disk', 'folder', 'total', 'library'],
  hero: { size: 'compact' },
};

const DataHomeHero = (props: HeroProps) => {
  const { slots, open } = props;
  const { Art, Eyebrow, Title, Actions, Tools, Facts } = slots;
  const { storage, capabilities } = usePlatform();
  const { summary, loading, refresh } = useStorageSummary(storage);
  const t = useT();
  const facts = useMemo(() => dataHomeFacts(summary, t), [summary, t]);

  return (
    <>
      <Art kind="none" />
      <Eyebrow>{t('views-data-home:hero.eyebrow')}</Eyebrow>
      <Title>{t('views-data-home:hero.title')}</Title>
      {capabilities.revealDataFolder && (
        <Actions>
          <Button variant="primary" icon={<Icon name="folder-open" />} onClick={() => void storage.reveal()}>{t('views-data-home:hero.open-folder')}</Button>
        </Actions>
      )}
      <Tools>
        <Button size="sm" variant="ghost" icon={<Icon name="refresh-cw" />} onClick={refresh}>{t('views-data-home:hero.refresh')}</Button>
      </Tools>
      <Facts rows={facts} />
      <DataHome summary={summary} loading={loading} open={open} />
    </>
  );
};

export default DataHomeHero;
export { meta };
