/* @layer sanctuary-site @kind component */
import { useMemo } from 'react';
import { Flex, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { SettingsPage } from '@drizztdourden08/tessera/composites';
import { SurfaceFilterBar, useSectionHeading } from '@rotp/design';
import type { TablePageProps } from './TablePage.type';
import './TablePage.css';

const TablePage = (props: TablePageProps) => {
  const { section, scope, actions, summary, error, filter, table, aside } = props;
  const heading = useSectionHeading(section);
  const headerTabs = useMemo(
    () => ({ items: scope.tabs, activeId: scope.activeId, onSelect: scope.select }),
    [scope.tabs, scope.activeId, scope.select],
  );

  return (
    <Flex gap="md" align="stretch" className="table-page">
      <SettingsPage icon={heading.icon} title={heading.title} tabs={headerTabs} scroll={false} actions={actions} className="table-page__page">
        <Stack gap="md" align="stretch" className="table-page__body">
          <Text as="span" variant="caption" className="table-page__summary">{summary}</Text>
          {error && <Text as="p" variant="caption" role="alert">{error}</Text>}
          <SurfaceFilterBar {...filter} />
          {table}
        </Stack>
      </SettingsPage>
      {aside}
    </Flex>
  );
};

export { TablePage };
