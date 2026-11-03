/* @layer renderer-components @kind types */

type PlacedBox = {
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  originX: number;
  originY: number;
};

type PlacedPartProps = {
  box: PlacedBox;
  src: string;
};

export type { PlacedBox, PlacedPartProps };
