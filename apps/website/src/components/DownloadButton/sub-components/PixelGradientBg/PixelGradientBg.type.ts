/* @layer website-site @kind types */
type GradientBand = { y: number; height: number; fill: string };

type DitherLine = { y: number; stroke: string; offset: number };

type GradientLayout = { bands: GradientBand[]; dither: DitherLine[]; height: number };

export type { DitherLine, GradientBand, GradientLayout };
