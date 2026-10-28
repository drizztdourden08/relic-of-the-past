/* @layer website-site @kind types */
type CloudStageProps = {
  words: readonly string[];
};

type CloudSize = {
  width: number;
  height: number;
};

type CloudRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type CloudTriangle = {
  centerX: number;
  top: number;
  height: number;
  half: number;
};

type CloudPlacement = {
  word: string;
  wrapped: boolean;
  ratio: CloudSize;
  tone: number;
  rect: CloudRect;
  fontPx: number;
};

type CloudItem = {
  word: string;
  ratio: CloudSize;
  wrapped: boolean;
};

type CloudMeasure = {
  single: CloudSize;
  wrapped: CloudSize | null;
};

type CloudRows = {
  rows: CloudRow[];
  score: number;
};

type CloudRow = {
  count: number;
  fontPx: number;
  top: number;
  height: number;
  reach: number;
};

type CloudFontRange = {
  min: number;
  max: number;
};

type CloudSpot = {
  rect: CloudRect;
  fontPx: number;
};

type CloudLayout = {
  placements: CloudPlacement[];
  relocate: (word: string) => void;
};

export type { CloudFontRange, CloudItem, CloudLayout, CloudMeasure, CloudPlacement, CloudRect, CloudRow, CloudRows, CloudSize, CloudSpot, CloudStageProps, CloudTriangle };
