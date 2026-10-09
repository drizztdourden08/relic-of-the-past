/* @layer electron-main @kind types */
interface ToolResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

export type { ToolResult };
