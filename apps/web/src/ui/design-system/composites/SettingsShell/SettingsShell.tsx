/* @layer renderer-components @kind component */
import { Box } from '../../primitives/Box';
import { SideNav } from '../SideNav';
import type { SettingsShellProps } from './SettingsShell.type';
import './SettingsShell.css';

/**
 * SettingsShell — the canonical "searchable side-nav + scrollable content panel"
 * layout used by settings-style pages (and the Design Gallery). Generic: the nav
 * is data, the panel is children.
 */
const SettingsShell = (props: SettingsShellProps) => {
  const { nav, children, className = '' } = props;
  return (
    <Box className={`settings-shell${className ? ` ${className}` : ''}`}>
      <SideNav {...nav} />
      <Box className="settings-shell__content">{children}</Box>
    </Box>
  );
};

export { SettingsShell };
