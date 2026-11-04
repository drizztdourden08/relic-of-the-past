/* @layer renderer-app @kind logic */
import { nav, useNavigationStore } from '@drizztdourden08/brock-react';
import { defineMcpTool } from '@drizztdourden08/brock-mcp';
import { MCP_TOOL_NAMES } from './mcp-tools.constants';

const currentScreenTool = defineMcpTool({
  name: MCP_TOOL_NAMES.currentScreen,
  description: 'Reports the screen that is open now and its section, or null when no screen is open.',
  readOnly: true,
  run: () => {
    const section = useNavigationStore.getState().params.section;
    return { data: { screen: nav.active(), section: typeof section === 'string' ? section : null } };
  },
});

export { currentScreenTool };
