/* @layer site-kit @kind component */
import { useMemo } from 'react';
import { Image, Text } from '@drizztdourden08/tessera/primitives';
import { SiteHeader } from '@drizztdourden08/tessera/composites';
import type { SiteHeaderBrand } from '@drizztdourden08/tessera/composites';
import { navigate } from '../../../router/useLocation';
import { useSiteDefinition } from '../../../site/site-context';

const goTo = (href: string) => navigate(href);

const SiteBar = () => {
  const { brand } = useSiteDefinition();
  const headerBrand = useMemo<SiteHeaderBrand>(() => ({
    logo: <Image className="site__logo" src={brand.logo} alt="" />,
    title: <Text as="span" className="site__wordmark">{brand.wordmark}</Text>,
    label: brand.homeLabel,
    href: '/',
  }), [brand]);
  return <SiteHeader brand={headerBrand} navigate={goTo} className="site__header" />;
};

export { SiteBar };
