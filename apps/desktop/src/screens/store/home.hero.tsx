/* @layer renderer-app @kind component */
import type { HeroProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { StoreHomeView } from '@app/views/Store/sub-components/StoreHomeView';

const meta: ScreenMeta = {
  title: 'Home',
  icon: 'house',
  keywords: ['hookshop', 'store', 'shop', 'packs', 'install', 'download', 'sign in', 'account'],
  hero: { size: 'compact' },
};

const StoreHomeHero = (props: HeroProps) => {
  const { Art, Eyebrow, Title } = props.slots;
  return (
    <>
      <Art kind="none" />
      <Eyebrow>Community packs</Eyebrow>
      <Title>Hookshop</Title>
      <StoreHomeView />
    </>
  );
};

export default StoreHomeHero;
export { meta };
