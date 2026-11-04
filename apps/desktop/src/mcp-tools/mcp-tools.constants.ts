/* @layer renderer-app @kind constants */
const MCP_TOOL_NAMES = {
  openWidget: 'rotp_open_widget',
  openScreen: 'rotp_open_screen',
  currentScreen: 'rotp_current_screen',
} as const;

const WIDGET_ACTIONS = ['open', 'close', 'focus'] as const;

export { MCP_TOOL_NAMES, WIDGET_ACTIONS };
