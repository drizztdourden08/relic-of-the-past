/* @layer sanctuary-site @kind component */
/**
 * The page frame. The router mounts one around every signed-in member page: the section
 * nav, the site's one search and the shared files and reports. A bare frame (sign-in,
 * waiting, device, the guard's own states) shows the brand alone above the content,
 * since those pages have no sections to move between.
 */
import type { ReactNode } from 'react';
import { Flex } from '@ds/primitives/Flex';
import { Box } from '@ds/primitives/Box';
import { SiteDataProvider } from '../../data/SiteDataProvider';
import { Brand } from '../Brand/Brand';
import { MemberFrame } from './sub-components/MemberFrame';
import './SiteFrame.css';

type SiteFrameProps = {
  /** No section nav: the brand alone heads the page. */
  bare?: boolean;
  children: ReactNode;
};

const SiteFrame = (props: SiteFrameProps) => {
  const { bare = false, children } = props;
  if (bare) {
    return (
      <Flex direction="column" align="stretch" className="site site--bare">
        <Box as="header" className="site__brand-strip"><Brand size="hero" /></Box>
        <Box as="main" className="site__main">{children}</Box>
      </Flex>
    );
  }
  return (
    <SiteDataProvider>
      <MemberFrame>{children}</MemberFrame>
    </SiteDataProvider>
  );
};

export { SiteFrame };
export type { SiteFrameProps };
