/* @layer sanctuary-site @kind component */
/**
 * The signed-in frame: the section nav down the left and the content pane beside it.
 * It stays mounted while the member pages change beneath it, so the nav keeps its width,
 * its search text and its focus. While the search is in use the pane shows the results
 * in place of the page; the route itself does not change.
 */
import type { ReactNode } from 'react';
import { Flex } from '@ds/primitives/Flex';
import { Box } from '@ds/primitives/Box';
import { SiteNav } from '../../SiteNav/SiteNav';
import { Brand } from '../../Brand/Brand';
import { SearchResults } from '../../../search/SearchResults/SearchResults';
import { useSiteSearch } from '../behavior/useSiteSearch';

type MemberFrameProps = { children: ReactNode };

const MemberFrame = (props: MemberFrameProps) => {
  const { children } = props;
  const { query, searching, field, clear } = useSiteSearch();
  return (
    <Flex direction="column" align="stretch" className="site">
      <Box as="header" className="site__header"><Brand /></Box>
      <Flex align="stretch" className="site__body">
        <SiteNav search={field} searching={searching} onNavigate={clear} />
        <Box as="main" className="site__main">
          {searching ? <SearchResults query={query} onDone={clear} /> : children}
        </Box>
      </Flex>
    </Flex>
  );
};

export { MemberFrame };
export type { MemberFrameProps };
