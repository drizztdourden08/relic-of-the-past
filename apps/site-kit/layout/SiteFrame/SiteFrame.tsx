/* @layer site-kit @kind component */
import { Flex } from '@ds/primitives/Flex';
import { Box } from '@ds/primitives/Box';
import { Brand } from '../Brand/Brand';
import { ToastLayer } from '../../components/ToastLayer';
import { useSiteDefinition } from '../../site/site-context';
import { MemberFrame } from './sub-components/MemberFrame';
import type { SiteFrameProps } from './SiteFrame.type';
import './SiteFrame.css';

const SiteFrame = (props: SiteFrameProps) => {
  const { bare = false, children } = props;
  const { MemberData } = useSiteDefinition();
  if (bare) {
    return (
      <Flex direction="column" align="stretch" className="site site--bare">
        <Box as="header" className="site__brand-strip"><Brand size="hero" /></Box>
        <Box as="main" className="site__main">{children}</Box>
        <ToastLayer />
      </Flex>
    );
  }
  return (
    <MemberData>
      <MemberFrame>{children}</MemberFrame>
      <ToastLayer />
    </MemberData>
  );
};

export { SiteFrame };
export type { SiteFrameProps } from './SiteFrame.type';
