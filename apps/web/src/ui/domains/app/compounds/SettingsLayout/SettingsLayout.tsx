/* @layer renderer-components @kind component */
/**
 * One settings tab. As a page it is a SettingsPage whose header links to each
 * section; as a search result it is only the rows matching the query, or
 * nothing at all when none match. See settings-page-context.ts.
 */
import { useContext, useMemo } from 'react';
import { Box } from '../../../../design-system/primitives/Box';
import { SettingsPage } from '../SettingsPage';
import { resolveSections } from './behavior/resolveSections';
import { useLockCause } from './behavior/useLockCause';
import { SettingsSections } from './sub-components/SettingsSections';
import { SettingsPageContext } from './behavior/settings-page-context';
import './SettingsLayout.css';
import type { SettingsLayoutProps } from './SettingsLayout.type';

const SettingsLayout = (props: SettingsLayoutProps) => {
  const { sections, settings, emptyMessage = 'Nothing to set here right now.' } = props;
  const page = useContext(SettingsPageContext);
  const query = page?.variant === 'results' ? page.query : '';
  const { lockCauseOf, isLockedKey } = useLockCause(settings);

  const resolved = useMemo(() => resolveSections(sections, query), [sections, query]);
  const anchors = useMemo(() => resolved.map((s) => ({ id: s.id, label: s.title })), [resolved]);

  const body = <SettingsSections {...props} sections={resolved} lockCauseOf={lockCauseOf} isLockedKey={isLockedKey} />;

  if (!page) return body;
  if (page.variant === 'results') return resolved.length > 0 ? body : null;
  return (
    <SettingsPage icon={page.icon} title={page.title} backdrop={page.backdrop} anchors={anchors}>
      {resolved.length > 0 ? body : <Box className="settings-layout__empty">{emptyMessage}</Box>}
    </SettingsPage>
  );
};

export { SettingsLayout };
