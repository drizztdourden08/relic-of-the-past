/* @layer renderer-lib @kind types */
interface DebugTextBuilder {
  buildDebugText: () => Promise<string>;
  version: string;
  runtime: string;
  engine: string;
  osLabel: string;
}

export type { DebugTextBuilder };
