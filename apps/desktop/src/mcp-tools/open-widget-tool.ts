/* @layer renderer-app @kind logic */
import { widgets } from '@drizztdourden08/brock-react';
import { defineMcpTool } from '@drizztdourden08/brock-mcp';
import { MCP_TOOL_NAMES, WIDGET_ACTIONS } from './mcp-tools.constants';
import type { WidgetAction } from './mcp-tools.type';

const isWidgetAction = (value: string): value is WidgetAction => WIDGET_ACTIONS.some((action) => action === value);

const openWidgetTool = defineMcpTool({
  name: MCP_TOOL_NAMES.openWidget,
  description: 'Opens, closes or focuses a widget by its id. Use list_widgets for the ids.',
  args: {
    id: { type: 'string', label: 'Widget id' },
    action: {
      type: 'string',
      label: 'Action',
      optional: true,
      options: WIDGET_ACTIONS.map((action) => ({ value: action, label: action })),
    },
  },
  run: (args) => {
    const id = String(args.id ?? '');
    const action = String(args.action ?? 'open');
    if (!isWidgetAction(action)) return { text: `The action ${action} is not open, close or focus.`, isError: true };
    const known = widgets.list().map((widget) => widget.id);
    if (!known.includes(id)) return { text: `Unknown widget "${id}". Known ids: ${known.join(', ')}.`, isError: true };
    widgets[action](id);
    return { data: { id, visible: widgets.isVisible(id) } };
  },
});

export { openWidgetTool };
