/* @layer renderer-app @kind component */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { useT } from '@drizztdourden08/brock-react';
import type { HeroProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { StoreHomeView } from '@app/views/Store/sub-components/StoreHomeView';

const meta: ScreenMeta = {
  title: msg('views-mobile-shell:menu.home'),
  icon: 'house',
  keywords: ['hookshop', 'store', 'shop', 'packs', 'install', 'download', 'sign in', 'account'],
  hero: { size: 'compact' },
};

const StoreHomeHero = (props: HeroProps) => {
  const { Art, Eyebrow, Title } = props.slots;
  const t = useT();
  return (
    <>
      <Art kind="none" />
      <Eyebrow>{t('views-store:hero.eyebrow')}</Eyebrow>
      <Title>{t('compounds:hookshop-chip.label')}</Title>
      <StoreHomeView />
    </>
  );
};

export default StoreHomeHero;
export { meta };
