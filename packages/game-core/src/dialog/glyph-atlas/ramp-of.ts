/* @layer bridge-wasm @kind logic */
import { snesToRgba } from '@rotp/asset-extraction';

const rampOf = (palette: number[]): string[] =>
  palette.map((word) => { const [r, g, b] = snesToRgba(word); return `rgb(${r} ${g} ${b})`; });

export { rampOf };
