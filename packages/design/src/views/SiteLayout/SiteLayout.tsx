/* @layer site-kit @kind component */
import { useCallback, useMemo } from 'react';
import { BRAND_FAMILY, BrandMark, Logo, PixelWordmark } from '@drizztdourden08/tessera/brand';
import { SideNavLayout, SiteFooter, SiteHeader, ToastStack } from '@drizztdourden08/tessera/composites';
import type { SiteHeaderBrand } from '@drizztdourden08/tessera/composites';
import { Box } from '@drizztdourden08/tessera/primitives';
import { navigate } from '../../hooks/useLocation';
import { useSiteDefinition } from '../../site/site-context';
import { useProfileAction } from './behavior/useProfileAction';
import { useSiteNav } from './behavior/useSiteNav';
import { useSiteSearch } from './behavior/useSiteSearch';
import { ROOT_PATH } from './SiteLayout.constants';
import type { SiteLayoutProps } from './SiteLayout.type';
import './SiteLayout.css';

const goTo = (href: string) => navigate(href);

const SiteLayout = (props: SiteLayoutProps) => {
  const { children } = props;
  const { brand, footer, search, MemberData } = useSiteDefinition();
  const { Results } = search;
  const { query, field, clear } = useSiteSearch(search.placeholder);
  const { config, activeId, select } = useSiteNav();
  const profile = useProfileAction();

  const headerBrand = useMemo<SiteHeaderBrand>(() => ({
    logo: <BrandMark app="rotp" size="md" />,
    title: <PixelWordmark text={brand.wordmark} colors={BRAND_FAMILY.rotp.wordmark.colors} size="sm" />,
    label: brand.homeLabel,
    href: ROOT_PATH,
  }), [brand]);

  const handleSelect = useCallback((id: string) => {
    clear();
    select(id);
  }, [clear, select]);

  const nav = useMemo(() => ({ config, activeId, onSelect: handleSelect, search: field }), [config, activeId, handleSelect, field]);

  return (
    <MemberData>
      <Box className="site-layout">
        <SiteHeader brand={headerBrand} navigate={goTo} profile={profile} />
        <Box as="main" className="site-layout__body">
          <SideNavLayout nav={nav} results={<Results query={query} onDone={clear} />} paneScroll="none">
            {children}
          </SideNavLayout>
        </Box>
        <SiteFooter logo={<Logo brand="rotp" size="sm" />} note={footer.note} links={footer.links} navigate={goTo} />
      </Box>
      <ToastStack position="bottom-left" />
    </MemberData>
  );
};

export { SiteLayout };
export type { SiteLayoutProps } from './SiteLayout.type';
