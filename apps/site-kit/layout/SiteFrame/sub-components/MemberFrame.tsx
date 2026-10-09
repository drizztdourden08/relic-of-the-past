/* @layer site-kit @kind component */
import { Flex, Box } from '@drizztdourden08/tessera/primitives';
import { SiteNav } from '../../SiteNav/SiteNav';
import { Brand } from '../../Brand/Brand';
import { useSiteDefinition } from '../../../site/site-context';
import { useSiteSearch } from '../behavior/useSiteSearch';
import type { MemberFrameProps } from './MemberFrame.type';

const MemberFrame = (props: MemberFrameProps) => {
  const { children } = props;
  const { search } = useSiteDefinition();
  const { Results } = search;
  const { query, searching, field, clear } = useSiteSearch(search.placeholder);
  return (
    <Flex direction="column" align="stretch" className="site">
      <Box as="header" className="site__header"><Brand /></Box>
      <Flex align="stretch" className="site__body">
        <SiteNav search={field} searching={searching} onNavigate={clear} />
        <Box as="main" className="site__main">
          {searching ? <Results query={query} onDone={clear} /> : children}
        </Box>
      </Flex>
    </Flex>
  );
};

export { MemberFrame };
