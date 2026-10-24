/* @layer bridge-wasm @kind types */
type InfoCheckInput = {
  client: { name: string; version: string };
  archipelagoVersion: string;
  worldVersion: string;
  worldBytes: number;
  yamlBytes: number[];
  game?: string;
};

export type { InfoCheckInput };
