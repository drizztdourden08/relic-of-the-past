/* @layer site-kit @kind component */
import { Flex, Box } from '@drizztdourden08/tessera/primitives';
import { ToastStack } from '@drizztdourden08/tessera/composites';
import { Brand } from '../Brand/Brand';
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
        <ToastStack position="bottom-left" />
      </Flex>
    );
  }
  return (
    <MemberData>
      <MemberFrame>{children}</MemberFrame>
      <ToastStack position="bottom-left" />
    </MemberData>
  );
};

export { SiteFrame };
export type { SiteFrameProps } from './SiteFrame.type';
