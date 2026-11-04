/* @layer renderer-app @kind data */
import { currentScreenTool } from './current-screen-tool';
import { openScreenTool } from './open-screen-tool';
import { openWidgetTool } from './open-widget-tool';

const APP_MCP_TOOLS = [openWidgetTool, openScreenTool, currentScreenTool];

export { APP_MCP_TOOLS };
