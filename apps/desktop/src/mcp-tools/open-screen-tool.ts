/* @layer renderer-app @kind logic */
import { nav } from '@drizztdourden08/brock-react';
import { defineMcpTool } from '@drizztdourden08/brock-mcp';
import { MCP_TOOL_NAMES } from './mcp-tools.constants';

const openScreenTool = defineMcpTool({
  name: MCP_TOOL_NAMES.openScreen,
  description: 'Navigates to a top-level screen by its route.',
  args: { route: { type: 'string', label: 'Screen route' } },
  run: (args) => {
    const route = String(args.route ?? '');
    const screens = nav.routes().filter((entry) => entry.kind === 'screen');
    if (!screens.some((entry) => entry.route === route)) {
      return { text: `Unknown screen "${route}". Known routes: ${screens.map((entry) => entry.route).join(', ')}.`, isError: true };
    }
    nav.open(route);
    return { data: { screen: nav.active() } };
  },
});

export { openScreenTool };
