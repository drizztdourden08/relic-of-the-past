/* @layer renderer-app @kind hook */
import { useMcpTools } from '@drizztdourden08/brock-mcp/renderer';
import { APP_MCP_TOOLS } from './app-mcp-tools';

const useAppMcpTools = (): void => {
  useMcpTools(APP_MCP_TOOLS);
};

export { useAppMcpTools };
