/* @layer shared-asset-extraction @kind types */
interface DecodedLine {
  key: string;
  text: string;
  limit: { kind: 'tiles'; max: number };
}

export type { DecodedLine };
